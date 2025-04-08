import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import barangResolver from '../../graphql/resolvers/barang.js';

describe('barangResolver', () => {
    let pool;

    beforeEach(() => {
        pool = {
        query: vi.fn(),
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });
    

    describe('Query.barang', () => {
        it('should return a single barang by id', async () => {
            const mockArgs = { id: 1 };
            const mockResult = [{ id: 1, name: 'Barang 1' }];
            pool.query.mockResolvedValueOnce([mockResult]);

            const result = await barangResolver.Query.barang(null, mockArgs, {pool});

            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_barang WHERE id = ?', [1]);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe('Query.allBarang', () => {
        it('should return all barang', async () => {
            const mockResult = [{ id: 1, name: 'Barang 1' }, { id: 2, name: 'Barang 2' }];
            pool.query.mockResolvedValueOnce([mockResult]);

            const result = await barangResolver.Query.allBarang(null, {}, {pool});

            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_barang');
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
            const mockResult = { insertId: 1, affectedRows: 1 };
            
            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            pool.query.mockResolvedValueOnce([[]]);

            const result = await barangResolver.Mutation.addBarang(null, mockArgs, { pool});
            
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

            const mockResult = { affectedRows: 1 };
            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            pool.query.mockResolvedValueOnce([[]]);
            
            const result = await barangResolver.Mutation.updateBarang(
                null,
                { id: 1, input: mockInput },
                { pool }
            );
            
            expect(result).toEqual({ id: 1, ...mockInput });
        });
    });
});
