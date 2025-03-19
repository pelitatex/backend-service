import barangTokoResolver from '../../graphql/resolvers/barangToko.js';
import { createPool } from 'mysql2/promise';


jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(),
}));

const mockPool = {
  query: jest.fn(),
}

const context = {
  pool: mockPool,
};

describe('barangSKUToko Resolver', () => {
  beforeAll(() => {
    createPool.mockReturnValue(mockPool);
  });

  describe('Query', () => {
    describe('barangSKUToko', () => {
      it('should return barangSKUToko by toko_id', async () => {
        const args = { toko_id: 1 };
        const rows = [{ id: 1, toko_id: 1, barang_sku_id: 1 }];
        mockPool.query.mockResolvedValue([rows]);

        const result = await barangSKUTokoResolver.Query.barangSKUToko(null, args, context);

        expect(result).toEqual(rows[0]);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM nd_toko_barang_sku WHERE toko_id = ?', [args.toko_id]);
      });

      it('should throw an error if toko_id is not provided', async () => {
        const args = {};

        await expect(barangSKUTokoResolver.Query.barangSKUToko(null, args, context)).rejects.toThrow('Toko ID is required');
      });
    });

    describe('allBarangSKUToko', () => {
      it('should return all barangSKUToko', async () => {
        const rows = [{ id: 1, toko_id: 1, barang_sku_id: 1 }];
        mockPool.query.mockResolvedValue([rows]);

        const result = await barangSKUTokoResolver.Query.allBarangSKUToko(null, null, context);

        expect(result).toEqual(rows);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM nd_toko_barang_sku');
      });
    });
  });

  describe('Mutation', () => {
    describe('addBarangSKUToko', () => {
      it('should add a new barangSKUToko', async () => {
        const input = { toko_id: 1, barang_sku_id: 1 };
        const checkRows = [];
        const insertQuery = [{ count: 0 }];
        mockPool.query
          .mockResolvedValueOnce([checkRows])
          .mockResolvedValueOnce([insertQuery]);

        const result = await barangSKUTokoResolver.Mutation.addBarangSKUToko(null, { input }, context);

        expect(result).toBe(true);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM nd_toko_barang_sku WHERE toko_id = ? and barang_sku_id = ?', [input.toko_id, input.barang_sku_id]);
        expect(mockPool.query).toHaveBeenCalledWith('INSERT INTO nd_toko_barang_sku (toko_id, barang_sku_id) VALUES  (?,?)', [input.toko_id, input.barang_sku_id]);
      });

      it('should throw an error if barangSKUToko already exists', async () => {
        const input = { toko_id: 1, barang_sku_id: 1 };
        const checkRows = [{ id: 1 }];
        mockPool.query.mockResolvedValueOnce([checkRows]);

        await expect(barangSKUTokoResolver.Mutation.addBarangSKUToko(null, { input }, context)).rejects.toThrow('Toko sudah punya barang sku.');
      });
    });
  });

  describe('BarangSKUToko', () => {
    describe('toko', () => {
      it('should return toko by toko_id', async () => {
        const parent = { toko_id: 1 };
        const rows = [{ id: 1, name: 'Toko 1' }];
        mockPool.query.mockResolvedValue([rows]);

        const result = await barangSKUTokoResolver.BarangSKUToko.toko(parent, null, context);

        expect(result).toEqual(rows[0]);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM nd_toko WHERE id = ?', [parent.toko_id]);
      });
    });

    describe('barangSKU', () => {
      it('should return barangSKU by barang_sku_id', async () => {
        const parent = { barang_sku_id: 1 };
        const rows = [{ id: 1, name: 'Barang SKU 1' }];
        mockPool.query.mockResolvedValue([rows]);

        const result = await barangSKUTokoResolver.BarangSKUToko.barangSKU(parent, null, context);

        expect(result).toEqual(rows[0]);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM nd_barang_sku WHERE id = ?', [parent.barang_sku_id]);
      });
    });
  });
});
