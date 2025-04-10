import { describe, it, expect, vi } from 'vitest';
import userResolver from '../../graphql/resolvers/user.js';
import bcrypt from 'bcrypt';
import jwt from '../../helpers/jwt.js';

vi.mock('../../helpers/jwt.js', () => ({
  generateToken: vi.fn(() => 'mocked-token'),
}));

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

vi.mock('../../helpers/queryTransaction.js', () => ({
  queryLogger: vi.fn(),
}));

const pool = {
  query: vi.fn(),
};

describe('userResolver', () => {
  describe('Mutation.login', () => {
    it('should return a token and timeout on successful login', async () => {
      pool.query.mockResolvedValueOnce([[{ id: 1, username: 'test', password: 'hashed', roles: 'admin', status_aktif: 1 }]]);
      bcrypt.compare.mockResolvedValueOnce(true);

      const result = await userResolver.Mutation.login({}, { username: 'test', password: 'password' }, { pool });

      expect(result).toEqual({ token: 'mocked-token', timeout: expect.any(Number) });
      expect(jwt.generateToken).toHaveBeenCalledWith(expect.objectContaining({ id: 1, username: 'test' }));
    });

    it('should throw an error if username is missing', async () => {
      await expect(userResolver.Mutation.login({}, { password: 'password' }, { pool }))
        .rejects.toThrow('Username is required.');
    });

    it('should throw an error if password is missing', async () => {
      await expect(userResolver.Mutation.login({}, { username: 'test' }, { pool }))
        .rejects.toThrow('Password is required.');
    });

    it('should throw an error if user is not found', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      await expect(userResolver.Mutation.login({}, { username: 'test', password: 'password' }, { pool }))
        .rejects.toThrow('User not found');
    });

    it('should throw an error if password does not match', async () => {
      pool.query.mockResolvedValueOnce([[{ id: 1, username: 'test', password: 'hashed', roles: 'admin', status_aktif: 1 }]]);
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(userResolver.Mutation.login({}, { username: 'test', password: 'wrong-password' }, { pool }))
        .rejects.toThrow('User and password not match');
    });

    it('should throw an error if user is inactive', async () => {
      pool.query.mockResolvedValueOnce([[{ id: 1, username: 'test', password: 'hashed', roles: 'admin', status_aktif: 0 }]]);
      bcrypt.compare.mockResolvedValueOnce(true);

      await expect(userResolver.Mutation.login({}, { username: 'test', password: 'password' }, { pool }))
        .rejects.toThrow('User is inactive.');
    });
  });

  describe('Mutation.addUser', () => {
    it('should add a user and return the user data', async () => {
      pool.query.mockResolvedValueOnce([{ insertId: 1 }]);
      bcrypt.hash.mockResolvedValueOnce('hashed-password');

      const input = {
        username: 'newuser',
        password: 'password',
        nama: 'Test User',
        has_account: true,
        roles: 'user',
      };

      pool.query.mockResolvedValueOnce([[]]); // Mock the query for checking existing username
      pool.query.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }]); 
      pool.query.mockResolvedValueOnce([[]]);

      const result = await userResolver.Mutation.addUser({}, { input }, { pool });

      expect(result).toEqual(expect.objectContaining({ ...input, id: 1 }));
      expect(pool.query).toHaveBeenCalled(4);
    });

    it('should throw an error if nama is missing', async () => {
      const input = { username: 'newuser', password: 'password', has_account: true };

      await expect(userResolver.Mutation.addUser({}, { input }, { pool }))
        .rejects.toThrow('Nama is required.');
    });
  });

  // Add more tests for other resolvers as needed...
});
