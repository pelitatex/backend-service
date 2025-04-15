import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import { getPool, setPool } from '../../utils/poolManager.js';
import { mockRabbitMQ, getPublishedMessages } from './setup/mock-rabbitmq.js';
import barangTokoResolver from '../../graphql/resolvers/barangToko.js';
import * as rabbitMQProducers from '../../rabbitMQ/barangSKUToko_producers.js';

let pool;
let rabbitMQ;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

vi.mock('../../rabbitMQ/barangSKUToko_producers.js', () => ({
  assignBarangToko: vi.fn(),
}));

beforeAll(async () => {
  rabbitMQ = mockRabbitMQ();

  await setPool('default');
  pool = await getPool();
  await pool.query("DELETE FROM nd_toko_barang_assignment");
  await pool.query("DELETE FROM nd_toko");
  await pool.query("DELETE FROM nd_barang");
  await pool.query("DELETE FROM nd_satuan");

  await pool.query("INSERT INTO nd_satuan (id, nama) VALUES (1, 'pcs')"); // Insert test data
  await pool.query("INSERT INTO nd_barang (id, nama_jual, satuan_id, status_aktif) VALUES (1, 'Barang A', 1, 1)"); // Insert test data
});

afterAll(async () => {
  try {
    console.log('Closing pool...');
    await pool.end();
    rabbitMQ.close();
    console.log('Resources cleaned up.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

describe('barangToko Resolver Integration Tests', () => {
  it('should fetch barangToko by toko_id', async () => {
    const toko_id = 1;

    // Insert test data
    await pool.query("INSERT INTO nd_toko (id, nama, alias, kode_toko) VALUES (1, 'Toko A', 'aliasA', 'XX')");
    await pool.query('INSERT INTO nd_toko_barang_assignment (toko_id, barang_id) VALUES (?, ?)', [toko_id, 1]);

    const result = await barangTokoResolver.Query.barangToko(null, { toko_id }, { pool });
    expect(result).toBeDefined();
    expect(result.toko_id).toBe(toko_id);
  });

  it('should add barangToko and send RabbitMQ message', async () => {
    const input = { toko_id: 2, barang_id: 1 };

    try {


      console.log('add toko.');
      await pool.query('INSERT INTO nd_toko (id, alias) VALUES (?, ?)', [input.toko_id, 'testAlias']);
      const messageObj = {
        id: 1,
        barang_id: input.barang_id,
        toko_id: input.toko_id,
        company: 'testAlias',
      };

      console.log('mockRabbitMQ.');
      const queName = 'queue';
      rabbitMQProducers.assignBarangToko.mockImplementation((queue= queName,message = messageObj)=>{
        rabbitMQ.sendToQueue(queue,JSON.stringify(message))
      });

      console.log('run resolver');
      const result = await barangTokoResolver.Mutation.addBarangToko(null, { input }, { pool });

      /* expect(result).toBeDefined();
      expect(result.id).toBeGreaterThan(0);
      
      console.log('get message');
      const messages = getPublishedMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].company).toBe('testAlias'); */
      
    } catch (error) {
      console.error('Error in test:', error);
      throw error; // Rethrow the error to fail the test
      
    }

    // Insert toko data for alias
    
  });
});
