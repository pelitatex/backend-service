import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import supplierResolver from '../../graphql/resolvers/supplier.js';

describe('supplierResolver', () => {
    let pool;

    beforeEach(() => {
        pool = {
            query: vi.fn(),
        };
    });

    describe('Query.supplier', () => {
        it('should return a single supplier by id', async () => {
            const mockArgs = { id: 1 };
            const mockResult = [{ id: 1, name: 'supplier 1' }];

            pool.query.mockResolvedValueOnce([mockResult]);
            
            const result = await supplierResolver.Query.supplier(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_supplier WHERE id = ?', [1]);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe(`Query.allsupplier`, () => {
        it('should return all supplier', async () => {
            const mockResult = [{ id: 1, name: 'supplier 1' }, { id: 2, name: 'supplier 2' }];
            pool.query.mockResolvedValueOnce([mockResult]);

            const result = await supplierResolver.Query.allSupplier(null, {}, {pool});
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nd_supplier');
            expect(result).toEqual(mockResult);
        });
    });

    describe('Mutation.addsupplier', () => {
        it('should add a new supplier and return the created supplier', async () => {
            const mockInput = {
                nama: 'supplier Baru',
                status_aktif: 1,
            };
            const mockArgs = { input: mockInput };
            const mockResult = { insertId: 1, affectedRows: 1 };

            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            pool.query.mockResolvedValueOnce([[]]);

            const result = await supplierResolver.Mutation.addSupplier(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledTimes(4);
            expect(result).toEqual({ id: 1, ...mockInput });
        });
    });

    describe('Mutation.updatesupplier', () => {
        it('should update an existing supplier and return the updated supplier', async () => {
            const mockArgs = { id: 1, input: { nama: 'supplier Updated' } };
            const mockResult = { affectedRows: 1 };

            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([mockResult]);
            pool.query.mockResolvedValueOnce([[]]);
            
            const result = await supplierResolver.Mutation.updateSupplier(null, mockArgs, {pool});
            expect(pool.query).toHaveBeenCalledTimes(4);
            expect(result).toEqual({ id: 1, ...mockArgs.input });
        });
    });

});
