import { describe, it, expect, vi, beforeEach } from 'vitest';
import barangComponentResolver from '../../graphql/resolvers/barangComponent.js';

describe('barangComponentResolver', () => {
    let pool;

    beforeEach(() => {
        pool = {
        query: vi.fn(),
        };
    });

    describe('Query', () => {
        it('should fetch a single "bahan" component', async () => {
            const mockArgs = { id: 1 };
            const mockResult = [{ id: 1, nama: 'Bahan1', kode: '01', keterangan: 'Test' }];
            pool.query.mockResolvedValueOnce([mockResult]);

            const result = await barangComponentResolver.Query.bahan({}, mockArgs, {pool});
            expect(result).toEqual(mockResult[0]);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_barang_bahan WHERE id = ?', [1]);
        });

        it('should fetch all "bahan" components', async () => {
            const mockResult = [
                { id: 1, nama: 'Bahan1', kode: '01', keterangan: 'Test' },
                { id: 2, nama: 'Bahan2', kode: '02', keterangan: 'Test2' },
            ];
            pool.query.mockResolvedValueOnce([mockResult]);

            const result = await barangComponentResolver.Query.allBahan({}, {}, {pool});
            expect(result).toEqual(mockResult);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_barang_bahan');
        });

        // ...similar tests for fitur, allFitur, grade, allGrade, tipe, allTipe...
    });

    describe('Mutation', () => {
        it('should add a new "bahan" component', async () => {
            const mockInput = { input: { nama: 'Bahan1', keterangan: 'Test' } };
            const mockResult = { insertId: 1 };
            const mockLastKode = [{ kode: '01' }];
            pool.query
                .mockResolvedValueOnce([[]]) // Check if "nama" exists
                .mockResolvedValueOnce([mockLastKode]) // Get last inserted kode
                .mockResolvedValueOnce([mockResult]); // Insert new record

            const result = await barangComponentResolver.Mutation.addBahan({}, mockInput, {pool});
            expect(result).toEqual({ id: 1, nama: 'BAHAN1', kode: '02', keterangan: 'Test' });
            expect(pool.query).toHaveBeenCalledTimes(3);
        });

        it('should update an existing "bahan" component', async () => {
            const mockArgs = { input: { nama: 'BahanUpdated', keterangan: 'Updated' }, id: 1 };
            const mockResult = { affectedRows: 1 };
            pool.query
                .mockResolvedValueOnce([[]]) // Check if "nama" exists
                .mockResolvedValueOnce([mockResult]); // Update record

            const result = await barangComponentResolver.Mutation.updateBahan({}, mockArgs, {pool});
            expect(result).toEqual(mockResult);
            expect(pool.query).toHaveBeenCalledTimes(2);
        });

        // ...similar tests for addFitur, updateFitur, addGrade, updateGrade, addTipe, updateTipe...
    });
});
