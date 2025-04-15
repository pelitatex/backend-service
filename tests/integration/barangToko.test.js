import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { getPool, setPool } from '../../utils/poolManager.js';
import { mockRabbitMQ, getPublishedMessages } from './setup/mock-rabbitmq.js';
import barangTokoResolver from '../../graphql/resolvers/barangToko.js';

let pool;
let rabbitMQ;

beforeAll(async () => {
  await setPool('default');
  pool = await getPool(); 
  await pool.query("TRUNCATE TABLE nd_toko_barang_assignment"); 
  await pool.query("INSERT INTO nd_toko_barang_assignment (toko_id, barang_id, is_synced, last_synced) VALUES (1, 1, 0, '2025-04-15 00:00:00')"); // Insert test data  
});

afterAll(async () => {
  await pool.end();
  rabbitMQ.close();
});

describe('barangToko Resolver Integration Tests', () => {
  it('should fetch barangToko by toko_id', async () => {
    const toko_id = 1;

    // Insert test data
    await pool.query('INSERT INTO nd_toko_barang_assignment (toko_id, barang_id) VALUES (?, ?)', [toko_id, 1]);

    const result = await barangTokoResolver.Query.barangToko(null, { toko_id }, { pool });
    expect(result).toBeDefined();
    expect(result.toko_id).toBe(toko_id);
  });

  it('should add barangToko and send RabbitMQ message', async () => {
    const input = { toko_id: 2, barang_id: 3 };

    // Insert toko data for alias
    await pool.query('INSERT INTO nd_toko (id, alias) VALUES (?, ?)', [input.toko_id, 'testAlias']);

    const result = await barangTokoResolver.Mutation.addBarangToko(null, { input }, { pool });
    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);

    const messages = getPublishedMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].company).toBe('testAlias');
  });
});
