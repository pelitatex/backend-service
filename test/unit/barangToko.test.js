import barangTokoResolver from '../../graphql/resolvers/barangToko.js';
import { createPool } from 'mysql2/promise';
import { vi, describe, expect, beforeAll, it } from 'vitest';
import { assignBarangToko } from '../../rabbitMQ/barangSKUToko_producers.js';

vi.mock('mysql2/promise', () => ({
  createPool: vi.fn(),
}));

vi.mock('../../rabbitMQ/barangSKUToko_producers.js', () => ({
  assignBarangToko: vi.fn(),
}));


const mockPool = {
  query: vi.fn(),
}

const context = {
  pool: mockPool,
  username:'test'
};

vi.mock(`amqplib`, () => {
  connect: vi.fn().mockRejectedValue(new Error('Failed to connect to RabbitMQ'))
});

describe('barangToko Resolver', () => {
  beforeAll(() => {
    createPool.mockReturnValue(mockPool);
  });

  describe('Query', () => {
    describe('barangToko', () => {
      it('should return barangToko by toko_id', async () => {
        const args = { toko_id: 1 };
        const rows = [{ id: 1, toko_id: 1, barang_id: 1 }];
        mockPool.query.mockResolvedValue([rows]);
        const result = await barangTokoResolver.Query.barangToko(null, args, context);

        expect(result).toEqual(rows[0]);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM nd_toko_barang_assignment WHERE toko_id = ?', [args.toko_id]);
      });

      it('should throw an error if toko_id is not provided', async () => {
        const args = {};

        await expect(barangTokoResolver.Query.barangToko(null, args, context)).rejects.toThrow('Toko ID is required');
      });
    });

    describe('allBarangToko', () => {
      it('should return all barangToko', async () => {
        const rows = [{ id: 1, toko_id: 1, barang_id: 1 },{ id: 2, toko_id: 2, barang_id: 1 }];
        mockPool.query.mockResolvedValue([rows]);

        const result = await barangTokoResolver.Query.allBarangToko(null, null, context);

        expect(result).toEqual(rows);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM nd_toko_barang_assignment');
      });
    });
  });

  describe('Mutation', () => {
    describe('addBarangToko', () => {
      it('should add a new barangToko', async () => {
        const input = { toko_id: 1, barang_id: 1, alias: 'Toko 1' };
        const insertQuery = [{ count: 0 }];
        mockPool.query
          .mockResolvedValueOnce([insertQuery]);

        const result = await barangTokoResolver.Mutation.addBarangToko(null, { input }, context);

        expect(result).toBe(true);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM nd_toko WHERE id = ?', [input.toko_id]);
        expect(mockPool.query).toHaveBeenCalledWith('INSERT INTO nd_toko_barang_assignment (toko_id, barang_id) VALUES  (?,?)', [input.toko_id, input.barang_id]);
      });

      it('should throw an error if barangToko already exists', async () => {
        const input = { toko_id: 1, barang_id: 1 };
        const checkRows = [{ id: 1 }];
        mockPool.query.mockResolvedValueOnce([checkRows]);

        await expect(barangTokoResolver.Mutation.addBarangToko(null, { input }, context)).rejects.toThrow('Barang sudah diregister di toko.');
      });
    });
  });

  /* describe('BarangToko', () => {
    describe('toko', () => {
      it('should return toko by toko_id', async () => {
        const parent = { toko_id: 1 };
        const rows = [{ id: 1, name: 'Toko 1' }];
        mockPool.query.mockResolvedValue([rows]);

        const result = await barangTokoResolver.BarangToko.toko(parent, null, context);

        expect(result).toEqual(rows[0]);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM nd_toko WHERE id = ?', [parent.toko_id]);
      });
    });

    describe('barang', () => {
      it('should return barang by barang_id', async () => {
        const parent = { barang_id: 1 };
        const rows = [{ id: 1, name: 'Barang 1' }];
        mockPool.query.mockResolvedValue([rows]);

        const result = await barangTokoResolver.BarangToko.barang(parent, null, context);

        expect(result).toEqual(rows[0]);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM nd_barang WHERE id = ?', [parent.barang_id]);
      });
    });
  }); */
});
