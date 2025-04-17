import request from 'supertest';
import app from '../../index.js';
import { getPool, setPool } from '../../utils/poolManager.js';
import dbToko from './utils/getTokoDb.js';

let server;
let pool;
let poolToko;

beforeAll(async () => {
    await setPool('default');
    pool = await getPool();
    server = app;
    poolToko = await dbToko();
    await pool.query("DELETE FROM nd_toko_barang_assignment");
    await pool.query("DELETE FROM nd_toko");
    await pool.query("DELETE FROM nd_barang");
});

afterAll(async () => {
  await pool.end();
});

describe('barangTokoResolver', () => {
  let tokoId, barangId;

  beforeAll(async () => {
    // Insert test data for toko and barang
    const [tokoResult] = await pool.query('INSERT INTO nd_toko (nama, alias) VALUES (?, ?)', ['Test Toko', 'test_alias']);
    tokoId = tokoResult.insertId;

    const [barangResult] = await pool.query(`INSERT INTO nd_barang (nama_jual, satuan_id, status_aktif) VALUES (?,?,?)`, ['Test Barang',1, 1]);
    barangId = barangResult.insertId;
  });

  afterAll(async () => {
    // Cleanup test data
    await pool.query('start transaction');
    await pool.query('DELETE FROM nd_toko_barang_assignment WHERE toko_id = ?', [tokoId]);
    await pool.query('DELETE FROM nd_toko WHERE id = ?', [tokoId]);
    await pool.query('DELETE FROM nd_barang WHERE id = ?', [barangId]);
    await pool.query('commit');
  });

  it('should fetch barangToko by toko_id', async () => {
    const query = `
      query GetBarangToko($toko_id: Int!) {
        barangToko(toko_id: $toko_id) {
          toko_id
          barang_id
        }
      }
    `;
    const variables = { toko_id: tokoId };

    const response = await request(server)
      .post('/graphql')
      .send({ query, variables });

    expect(response.status).toBe(200);
    expect(response.body.data.barangToko).toBeNull(); // No data initially
  });

  it('should add a barangToko and fetch it', async () => {
    const mutation = `
      mutation AddBarangToko($input: AddBarangTokoInput!) {
        addBarangToko(input: $input) {
          id
        }
      }
    `;

    const variables = { input: { toko_id: tokoId, barang_id: barangId } };

    const addResponse = await request(server)
      .post('/graphql')
      .send({ query: mutation, variables });

    expect(addResponse.status).toBe(200);
    expect(addResponse.body.data.addBarangToko.id).toBeDefined();

    const query = `
      query GetBarangToko($toko_id: Int!) {
        barangToko(toko_id: $toko_id) {
          toko_id
          barang_id
        }
      }
    `;
    const fetchResponse = await request(server)
      .post('/graphql')
      .send({ query, variables: { toko_id: tokoId } });

    expect(fetchResponse.status).toBe(200);
    expect(fetchResponse.body.data.barangToko).toEqual({
      toko_id: tokoId,
      barang_id: barangId,
    });

    const tokoResponse = await poolToko.query('SELECT * FROM nd_barang WHERE toko_id = ? AND barang_id = ?', [barangId]);

  });

  it('should fetch all barangToko', async () => {
    const query = `
      query GetAllBarangToko {
        allBarangToko {
          toko_id
          barang_id
        }
      }
    `;

    const response = await request(server).post('/graphql').send({ query });

    expect(response.status).toBe(200);
    expect(response.body.data.allBarangToko).toContainEqual({
      toko_id: tokoId,
      barang_id: barangId,
    });
  });
});
