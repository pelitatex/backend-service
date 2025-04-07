import { describe, it, expect, vi, afterEach } from 'vitest';
import barangResolver from '../../graphql/resolvers/barang.js';

describe('barangResolver', () => {
    const mockPool = {
        query: vi.fn(),
    };

    const mockContext = {
        pool: mockPool,
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Query.barang', () => {
        it('should return a single barang by id', async () => {
            const mockArgs = { id: 1 };
            const mockResult = [{ id: 1, name: 'Barang 1' }];
            mockPool.query.mockResolvedValueOnce([mockResult]);

            const result = await barangResolver.Query.barang(null, mockArgs, mockContext);

            expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM nd_barang WHERE id = ?', [1]);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe('Query.allBarang', () => {
        it('should return all barang', async () => {
            const mockResult = [{ id: 1, name: 'Barang 1' }, { id: 2, name: 'Barang 2' }];
            mockPool.query.mockResolvedValueOnce([mockResult]);

            const result = await barangResolver.Query.allBarang(null, {}, mockContext);

            expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM nd_barang');
            expect(result).toEqual(mockResult);
        });
    });

    describe('Mutation.addBarang', () => {
        it('should add a new barang and return the created barang', async () => {
            const mockInput = {
                sku_id: 'SKU123',
                nama_jual: 'Barang Jual',
                nama_beli: 'Barang Beli',
                satuan_id: 1,
                jenis_barang: 'Type A',
                grade: 'A',
                bahan: 'Material',
                tipe: 'Type',
                fitur: 'Feature',
                qty_warning: 10,
                deskripsi_info: 'Description',
                status_aktif: 1,
            };
            const mockArgs = { input: mockInput };
            const mockResult = { id: 1 };
            const mockTransaction = {
                insert: vi.fn().mockResolvedValueOnce(mockResult),
            };
            mockContext.queryTransaction = mockTransaction;

            const result = await barangResolver.Mutation.addBarang(null, mockArgs, mockContext);

            expect(mockTransaction.insert).toHaveBeenCalledWith(
                mockContext,
                'nd_barang',
                expect.any(String),
                expect.any(Array)
            );
            expect(result).toEqual({ id: 1, ...mockInput });
        });
    });

    describe('Mutation.updateBarang', () => {
        it('should update an existing barang and return the updated barang', async () => {
            const mockInput = {
                sku_id: 'SKU123',
                nama_jual: 'Updated Jual',
                nama_beli: 'Updated Beli',
                satuan_id: 1,
                jenis_barang: 'Type B',
                grade: 'B',
                bahan: 'Updated Material',
                tipe: 'Updated Type',
                fitur: 'Updated Feature',
                qty_warning: 5,
                deskripsi_info: 'Updated Description',
                status_aktif: 0,
            };
            const mockArgs = { id: 1, input: mockInput };
            const mockTransaction = {
                update: vi.fn().mockResolvedValueOnce({}),
            };
            mockContext.queryTransaction = mockTransaction;

            const result = await barangResolver.Mutation.updateBarang(null, mockArgs, mockContext);

            expect(mockTransaction.update).toHaveBeenCalledWith(
                mockContext,
                'nd_barang',
                1,
                expect.any(String),
                expect.any(Array)
            );
            expect(result).toEqual({ id: 1, ...mockInput });
        });
    });
});
