import { describe, it, expect, vi } from 'vitest';
import customerResolver from '../../graphql/resolvers/customer.js';
import { queryTransaction } from '../../helpers/queryTransaction.js';
import { publishExchange } from '../../helpers/producers.js';

vi.mock('../../helpers/queryTransaction.js', () => ({
  queryTransaction: {
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../helpers/producers.js', () => ({
  publishExchange: vi.fn(),
}));

describe('Customer Resolver', () => {
  describe('Mutation: addCustomer', () => {
    it('should insert a new customer and return the result', async () => {
      const input = { name: 'John Doe', email: 'john.doe@example.com' };
      const context = {};
      const mockResult = { insertId: 1 };

      queryTransaction.insert.mockResolvedValue(mockResult);

      const result = await customerResolver.Mutation.addCustomer({}, { input }, context);

      expect(queryTransaction.insert).toHaveBeenCalledWith(
        context,
        'nd_customer',
        expect.stringContaining('INSERT INTO nd_customer'),
        expect.arrayContaining(['John Doe', 'john.doe@example.com'])
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('Mutation: updateCustomer', () => {
    it('should update an existing customer and publish an event', async () => {
      const id = 1;
      const input = { name: 'Jane Doe', npwp: '123456789' };
      const context = {};
      const mockResult = { affectedRows: 1 };

      queryTransaction.update.mockResolvedValue(mockResult);

      const result = await customerResolver.Mutation.updateCustomer({}, { id, input }, context);

      expect(queryTransaction.update).toHaveBeenCalledWith(
        context,
        'nd_customer',
        id,
        expect.stringContaining('UPDATE nd_customer'),
        expect.arrayContaining(['Jane Doe', '123456789', id])
      );
      expect(publishExchange).toHaveBeenCalledWith(
        'customer_legacy_events',
        'customer.master_updated',
        expect.any(Buffer)
      );
      expect(result).toEqual(mockResult);
    });
  });
});
