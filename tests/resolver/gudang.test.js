import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import gudangResolver from '../../graphql/resolvers/gudang.js';

describe('gudangResolver', () => {
    let pool;

    beforeEach(() => {
        pool = {
            query: vi.fn(),
        };
    });

    describe('Query.gudang', () => {
        it('should return a single gudang by id', async () => {
            const mockArgs = { id: 1 };
            const mockResult = [{ id: 1, name: 'Gudang 1' }];

            pool.query.mockResolvedValueOnce([mockResult]);
            
            const result = await gudangResolver.Query.gudang(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_gudang WHERE id = ?', [1]);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe(`Query.allGudang`, () => {
        it('should return all gudang', async () => {
            const mockResult = [{ id: 1, name: 'Gudang 1' }, { id: 2, name: 'Gudang 2' }];
            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            pool.query.mockResolvedValueOnce([[]]);

            const result = await gudangResolver.Query.allGudang(null, {}, {pool});
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_gudang');
            expect(result).toEqual(mockResult);
        });
    });

    describe('Mutation.addGudang', () => {
        it('should add a new gudang and return the created gudang', async () => {
            const mockInput = {
                nama: 'Gudang Baru',
                alamat: 'Alamat Gudang',
                status_aktif: 1,
            };
            const mockArgs = { input: mockInput };
            const mockResult = { insertId: 1, affectedRows: 1 };

            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            pool.query.mockResolvedValueOnce([{ id: 1, ...mockInput }]); // Simulate fetching the created gudang
            pool.query.mockResolvedValueOnce([[]]);

            const result = await gudangResolver.Mutation.addGudang(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledTimes(2);
            expect(result).toEqual({ id: 1, ...mockInput });
        });
    });

    describe('Mutation.updateGudang', () => {
        it('should update an existing gudang and return the updated gudang', async () => {
            const mockArgs = { id: 1, input: { nama: 'Gudang Updated' } };
            const mockResult = { affectedRows: 1 };

            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            
            const result = await gudangResolver.Mutation.updateGudang(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledTimes(2);
            expect(result).toEqual({ id: 1, ...mockArgs.input });
        });
    });

});
