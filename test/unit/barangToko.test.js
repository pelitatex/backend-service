import { describe, it, expect, vi, beforeEach } from 'vitest';
import barangTokoResolver from '../../graphql/resolvers/barangToko.js';
import { ENVIRONMENT } from '../../config/loadEnv.js';
import { assignBarangToko } from '../../rabbitMQ/barangSKUToko_producers.js';
import { queryLogger } from '../../helpers/queryTransaction.js';

vi.mock('../../rabbitMQ/barangSKUToko_producers.js', () => ({
  assignBarangToko: vi.fn(),
}));

vi.mock('../../helpers/queryTransaction.js', () => ({
  queryLogger: vi.fn(),
}));

describe('barangTokoResolver', () => {
  let pool;

  beforeEach(() => {
    pool = {
      query: vi.fn(),
    };
  });

  describe('Query.barangToko', () => {
    it('should return a single barangToko by toko_id', async () => {
      const toko_id = 1;
      const mockResult = [{ id: 1, toko_id, barang_id: 2 }];
      pool.query.mockResolvedValueOnce([mockResult]);

      const result = await barangTokoResolver.Query.barangToko(
        {},
        { toko_id },
        { pool }
      );

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM nd_toko_barang_assignment WHERE toko_id = ?',
        [toko_id]
      );
      expect(result).toEqual(mockResult[0]);
    });

    it('should throw an error if toko_id is not provided', async () => {
      await expect(
        barangTokoResolver.Query.barangToko({}, {}, { pool })
      ).rejects.toThrow('Toko ID is required');
    });
  });

  describe('Query.allBarangToko', () => {
    it('should return all barangToko', async () => {
      const mockResult = [{ id: 1, toko_id: 1, barang_id: 2 }];
      pool.query.mockResolvedValueOnce([mockResult]);

      const result = await barangTokoResolver.Query.allBarangToko(
        {},
        {},
        { pool }
      );

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM nd_toko_barang_assignment'
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('Mutation.addBarangToko', () => {
    it('should add a barangToko and return its ID', async () => {
      const input = { toko_id: 1, barang_id: 2 };
      const mockTokoRows = [{ alias: 'testAlias' }];
      const mockInsertResult = { affectedRows: 1, insertId: 123 };

      pool.query
        .mockResolvedValueOnce([mockTokoRows]) // SELECT * FROM nd_toko
        .mockResolvedValueOnce() // START TRANSACTION
        .mockResolvedValueOnce([mockInsertResult]) // INSERT INTO nd_toko_barang_assignment
        .mockResolvedValueOnce(); // COMMIT

      const result = await barangTokoResolver.Mutation.addBarangToko(
        {},
        { input },
        { pool }
      );

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM nd_toko WHERE id = ?',
        [input.toko_id]
      );
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO nd_toko_barang_assignment (toko_id, barang_id) VALUES  (?,?) ',
        [input.toko_id, input.barang_id]
      );
      expect(assignBarangToko).toHaveBeenCalledWith({
        company: 'testAlias',
        toko_id: input.toko_id,
        barang_id: input.barang_id,
        pool,
      });
      expect(queryLogger).toHaveBeenCalledWith(
        pool,
        'nd_toko_barang_assignment',
        mockInsertResult.insertId,
        'INSERT INTO nd_toko_barang_assignment (toko_id, barang_id) VALUES  (?,?) ',
        [input.toko_id, input.barang_id]
      );
      expect(result).toEqual({ id: mockInsertResult.insertId });
    });

    it('should rollback and throw an error if the transaction fails', async () => {
      const input = { toko_id: 1, barang_id: 2 };
      const mockTokoRows = [{ alias: 'testAlias' }];

      pool.query
        .mockResolvedValueOnce([mockTokoRows]) // SELECT * FROM nd_toko
        .mockResolvedValueOnce() // START TRANSACTION
        .mockRejectedValueOnce(new Error('Insert failed')) // INSERT INTO nd_toko_barang_assignment
        .mockResolvedValueOnce(); // ROLLBACK

      await expect(
        barangTokoResolver.Mutation.addBarangToko({}, { input }, { pool })
      ).rejects.toThrow('Insert failed');

      expect(pool.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('BarangToko.toko', () => {
    it('should return the toko for a given barangToko', async () => {
      const parent = { toko_id: 1 };
      const mockResult = [{ id: 1, name: 'Toko A' }];
      pool.query.mockResolvedValueOnce([mockResult]);

      const result = await barangTokoResolver.BarangToko.toko(
        parent,
        {},
        { pool }
      );

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM nd_toko WHERE id = ?',
        [parent.toko_id]
      );
      expect(result).toEqual(mockResult[0]);
    });
  });

  describe('BarangToko.barang', () => {
    it('should return the barang for a given barangToko', async () => {
      const parent = { barang_id: 2 };
      const mockResult = [{ id: 2, name: 'Barang A' }];
      pool.query.mockResolvedValueOnce([mockResult]);

      const result = await barangTokoResolver.BarangToko.barang(
        parent,
        {},
        { pool }
      );

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM nd_barang WHERE id = ?',
        [parent.barang_id]
      );
      expect(result).toEqual(mockResult[0]);
    });
  });
});
