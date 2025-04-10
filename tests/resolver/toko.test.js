import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import tokoResolver from '../../graphql/resolvers/toko.js';

describe('tokoResolver', () => {
    let pool;

    beforeEach(() => {
        pool = {
            query: vi.fn(),
        };
    });

    describe('Query.toko', () => {
        it('should return a single toko by id', async () => {
            const mockArgs = { id: 1 };
            const mockResult = [{ id: 1, name: 'toko 1' }];

            pool.query.mockResolvedValueOnce([mockResult]);
            
            const result = await tokoResolver.Query.toko(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_toko WHERE id = ?', [1]);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe(`Query.alltoko`, () => {
        it('should return all toko', async () => {
            const mockResult = [{ id: 1, name: 'toko 1' }, { id: 2, name: 'toko 2' }];
            pool.query.mockResolvedValueOnce([mockResult]);

            const result = await tokoResolver.Query.allToko(null, {}, {pool});
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_toko');
            expect(result).toEqual(mockResult);
        });
    });

    describe('Mutation.addtoko', () => {
        it('should add a new toko and return the created toko', async () => {
            const mockInput = {
                nama: 'toko Baru',
                status_aktif: 1,
            };
            const mockArgs = { input: mockInput };
            const mockResult = { insertId: 1, affectedRows: 1 };

            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            pool.query.mockResolvedValueOnce([[]]);

            const result = await tokoResolver.Mutation.addToko(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledTimes(4);
            expect(result).toEqual({ id: 1, ...mockInput });
        });
    });

    describe('Mutation.updatetoko', () => {
        it('should update an existing toko and return the updated toko', async () => {
            const mockArgs = { id: 1, input: { nama: 'toko Updated' } };
            const mockResult = { affectedRows: 1 };

            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            pool.query.mockResolvedValueOnce([[]]);
            
            const result = await tokoResolver.Mutation.updateToko(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledTimes(4);
            expect(result).toEqual({ id: 1, ...mockArgs.input });
        });
    });

});
