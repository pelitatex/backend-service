import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import satuanResolver from '../../graphql/resolvers/satuan.js';

describe('satuanResolver', () => {
    let pool;

    beforeEach(() => {
        pool = {
            query: vi.fn(),
        };
    });

    describe('Query.satuan', () => {
        it('should return a single satuan by id', async () => {
            const mockArgs = { id: 1 };
            const mockResult = [{ id: 1, name: 'satuan 1' }];

            pool.query.mockResolvedValueOnce([mockResult]);
            
            const result = await satuanResolver.Query.satuan(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_satuan WHERE id = ?', [1]);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe(`Query.allsatuan`, () => {
        it('should return all satuan', async () => {
            const mockResult = [{ id: 1, name: 'satuan 1' }, { id: 2, name: 'satuan 2' }];
            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            pool.query.mockResolvedValueOnce([[]]);

            const result = await satuanResolver.Query.allsatuan(null, {}, {pool});
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_satuan');
            expect(result).toEqual(mockResult);
        });
    });

    describe('Mutation.addsatuan', () => {
        it('should add a new satuan and return the created satuan', async () => {
            const mockInput = {
                nama: 'satuan Baru',
                alamat: 'Alamat satuan',
                status_aktif: 1,
            };
            const mockArgs = { input: mockInput };
            const mockResult = { insertId: 1, affectedRows: 1 };

            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            pool.query.mockResolvedValueOnce([{ id: 1, ...mockInput }]); // Simulate fetching the created satuan
            pool.query.mockResolvedValueOnce([[]]);

            const result = await satuanResolver.Mutation.addsatuan(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledTimes(2);
            expect(result).toEqual({ id: 1, ...mockInput });
        });
    });

    describe('Mutation.updatesatuan', () => {
        it('should update an existing satuan and return the updated satuan', async () => {
            const mockArgs = { id: 1, input: { nama: 'satuan Updated' } };
            const mockResult = { affectedRows: 1 };

            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            
            const result = await satuanResolver.Mutation.updatesatuan(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledTimes(2);
            expect(result).toEqual({ id: 1, ...mockArgs.input });
        });
    });

});
