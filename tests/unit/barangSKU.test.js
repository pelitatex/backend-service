import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import barangSKUResolver from '../../graphql/resolvers/barangSKU.js';
import handleResolverError from '../../graphql/handleResolverError.js';
import { assignSingleBarangSKUToko } from '../../rabbitMQ/barangSKUToko_producers.js';

vi.mock('../handleResolverError.js', () => ({
  default: vi.fn((fn) => fn),
}));

vi.mock('../../rabbitMQ/barangSKUToko_producers.js', () => ({
  assignSingleBarangSKUToko: vi.fn(),
}));

describe('barangSKUResolver', () => {
  let pool;

  beforeEach(() => {
    pool = {
      query: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Query.barangSKU', () => {
    it('should fetch a single barangSKU by id', async () => {
      const mockResult = [{ id: 1, nama_barang: 'Test Barang' }];
      pool.query.mockResolvedValueOnce([mockResult]);

      const result = await barangSKUResolver.Query.barangSKU(
        null,
        { id: 1 },
        { pool }
      );

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM nd_barang_sku WHERE id = ?',
        [1]
      );
      expect(result).toEqual(mockResult[0]);
    });
  });

  describe('Query.allBarangSKU', () => {
    it('should fetch all barangSKU', async () => {
      const mockResult = [
        { id: 1, nama_barang: 'Test Barang 1' },
        { id: 2, nama_barang: 'Test Barang 2' },
      ];
      pool.query.mockResolvedValueOnce([mockResult]);

      const result = await barangSKUResolver.Query.allBarangSKU(
        null,
        {},
        { pool }
      );

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_barang_sku');
      expect(result).toEqual(mockResult);
    });
  });

  describe('Mutation.addBarangSKU', () => {
    it('should add new barangSKU and return the inserted data', async () => {
      const input ={ barang_id:1, warna_id:1, satuan_id: 1 };

      const mockResult = { insertId: 1 };
      // newItems.push([sku_id, nama_barang, nama_jual, barang_id, warna_id, satuan_id, status_aktif]);
      
      pool.query.mockResolvedValueOnce([{ nama: 'Barang Test' }]);
      pool.query.mockResolvedValueOnce([{ warna_jual: 'Merah' }]);
      pool.query.mockResolvedValueOnce([{ nama: 'PCS' }]);

      pool.query.mockResolvedValueOnce([[]]);
      pool.query.mockResolvedValueOnce([mockResult]);
      pool.query.mockResolvedValueOnce([[]]);

      

      const result = await barangSKUResolver.Mutation.addBarangSKU(
        null,
        { input },
        { pool }
      );

      expect(pool.query).toHaveBeenCalledTimes(7);
      expect(assignSingleBarangSKUToko).toHaveBeenCalledWith(1, pool);
      expect(result).toMatchObject({
        id: 1,
        sku_id: expect.any(String),
        nama_barang: expect.any(String),
        nama_jual: expect.any(String),
        barang_id: 1,
        warna_id: 1,
        satuan_id: 1,
        status_aktif: 1,
      });
    });
  });

  describe('Mutation.addBarangSKUBulk', () => {
    it('should add new barangSKUBulk and return the inserted data', async () => {
      const input =[
        { barang_id:1, warna_id:1, satuan_id: 1 }
      ];

      const mockResult = { insertId: 1,affectedRows: 1 };
      // newItems.push([sku_id, nama_barang, nama_jual, barang_id, warna_id, satuan_id, status_aktif]);
      
      pool.query.mockResolvedValueOnce([[{ id:1, nama: 'Barang Test' }]]);
      pool.query.mockResolvedValueOnce([[{ id:1, warna_jual: 'Merah' }]]);
      pool.query.mockResolvedValueOnce([[{ id:1, nama: 'PCS' }]]);

      pool.query.mockResolvedValueOnce([[]]);
      pool.query.mockResolvedValueOnce([mockResult]);
      pool.query.mockResolvedValueOnce([[]]);
      // ini untuk queryLogger
      pool.query.mockResolvedValueOnce([[]]);
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            sku_id: '123-1231-231',
            nama_barang: 'Barang Test Merah PCS',
            nama_jual: 'Barang Test Merah',
            barang_id: 1,
            warna_id: 1,
            satuan_id: 1,
            status_aktif: 1
          }
        ],undefined
      ]);
      

      const result = await barangSKUResolver.Mutation.addBarangSKUBulk(
        null,
        { input },
        { pool }
      );

      expect(pool.query).toHaveBeenCalledTimes(8);
      // expect(assignSingleBarangSKUToko).toHaveBeenCalledWith(1, pool);
      expect(result).toMatchObject([{
        id: 1,
        sku_id: expect.any(String),
        nama_barang: expect.any(String),
        nama_jual: expect.any(String),
        barang_id: 1,
        warna_id: 1,
        satuan_id: 1,
        status_aktif: 1,
      }]);
    });
  });

});
