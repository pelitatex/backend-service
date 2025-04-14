import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import warnaResolver from '../../graphql/resolvers/warna.js';

describe('warnaResolver', () => {
    let pool;

    beforeEach(() => {
        pool = {
            query: vi.fn(),
        };
    });

    describe('Query.warna', () => {
        it('should return a single warna by id', async () => {
            const mockArgs = { id: 1 };
            const mockResult = [{ id: 1, name: 'warna 1' }];

            pool.query.mockResolvedValueOnce([mockResult]);
            
            const result = await warnaResolver.Query.warna(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_warna WHERE id = ?', [1]);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe(`Query.allwarna`, () => {
        it('should return all warna', async () => {
            const mockResult = [{ id: 1, name: 'warna 1' }, { id: 2, name: 'warna 2' }];
            pool.query.mockResolvedValueOnce([mockResult]);

            const result = await warnaResolver.Query.allWarna(null, {}, {pool});
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_warna');
            expect(result).toEqual(mockResult);
        });
    });

    describe('Mutation.addwarna', () => {
        it('should add a new warna and return the created warna', async () => {
            const mockInput = {
                warna_jual:'Warna Updated',
                warna_beli:'Warna Updated',
                kode_warna:'',
                status_aktif:1
            };
            const mockArgs = { input: mockInput };
            const mockResult = { insertId: 1, affectedRows: 1 };
            

            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            pool.query.mockResolvedValueOnce([[]]);

            const result = await warnaResolver.Mutation.addWarna(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledTimes(4);
            expect(result).toEqual({ id: 1, ...mockInput });
        });
    });

    describe('Mutation.updatewarna', () => {
        it('should update an existing warna and return the updated warna', async () => {
            const mockArgs = { id: 1, input: {
                id: 1,
                warna_jual:'Warna Updated',
                warna_beli:'Warna Updated',
                kode_warna:'',
                status_aktif:1
            }};
            const mockResult = { affectedRows: 1 };

            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            pool.query.mockResolvedValueOnce([[]]);
            
            const result = await warnaResolver.Mutation.updateWarna(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledTimes(4);
            expect(result).toEqual({ id: 1, ...mockArgs.input });
        });
    });

});
