import barangSKUResolver from '../../graphql/resolvers/barangSKU.js';
import handleResolverError from '../../graphql/handleResolverError.js';
import { assignSingleBarangSKUToko } from '../../rabbitMQ/barangSKUToko_producers.js';

jest.mock('../handleResolverError.js', () => jest.fn((fn) => fn));
jest.mock('../../rabbitMQ/barangSKUToko_producers.js', () => ({
  assignSingleBarangSKUToko: jest.fn(),
}));

describe('barangSKUResolver', () => {
  let pool;

  beforeEach(() => {
    pool = {
      query: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      const input = [
        { barang_id: 1, warna_id: 2, status_aktif: true },
      ];
      const mockResult = { insertId: 1 };
      pool.query.mockResolvedValueOnce([[{ nama: 'Barang Test', satuan_id: 3 }]]);
      pool.query.mockResolvedValueOnce([[{ warna_jual: 'Merah' }]]);
      pool.query.mockResolvedValueOnce([[{ nama: 'PCS' }]]);
      pool.query.mockResolvedValueOnce([mockResult]);

      const result = await barangSKUResolver.Mutation.addBarangSKU(
        null,
        { input },
        { pool }
      );

      expect(pool.query).toHaveBeenCalledTimes(4);
      expect(assignSingleBarangSKUToko).toHaveBeenCalledWith(1, pool);
      expect(result).toMatchObject({
        id: 1,
        sku_id: expect.any(String),
        nama_barang: expect.any(String),
        nama_jual: expect.any(String),
        barang_id: 1,
        warna_id: 2,
        satuan_id: 3,
        status_aktif: true,
      });
    });
  });

  describe('Mutation.updateBarangSKU', () => {
    it('should update an existing barangSKU and return the updated data', async () => {
      const id = 1;
      const input = { nama_barang: 'Updated Barang', status_aktif: true };
      const mockResult = { affectedRows: 1 };
      const mockUpdatedData = [{ id: 1, nama_barang: 'Updated Barang' }];

      pool.query.mockResolvedValueOnce([[]]); // Check for duplicates
      pool.query.mockResolvedValueOnce([mockResult]);
      pool.query.mockResolvedValueOnce([mockUpdatedData]);

      const result = await barangSKUResolver.Mutation.updateBarangSKU(
        null,
        { id, input },
        { pool }
      );

      expect(pool.query).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockUpdatedData[0]);
    });

    it('should throw an error if the barangSKU does not exist', async () => {
      const id = 1;
      const input = { nama_barang: 'Nonexistent Barang', status_aktif: true };
      const mockResult = { affectedRows: 0 };

      pool.query.mockResolvedValueOnce([[]]); // Check for duplicates
      pool.query.mockResolvedValueOnce([mockResult]);

      await expect(
        barangSKUResolver.Mutation.updateBarangSKU(null, { id, input }, { pool })
      ).rejects.toThrow('Barang SKU not found');
    });
  });
});
