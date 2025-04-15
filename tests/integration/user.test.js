import { describe, it, expect, beforeAll, afterAll,vi } from 'vitest';
import userResolver from '../../graphql/resolvers/user.js';
import { getPool } from '../../utils/poolManager.js';
import bcrypt from 'bcrypt';

let pool;

// mock bcrypt and jwt
vi.mock('bcrypt', async () => {
  const actual = await vi.importActual('bcrypt');
  return {
    ...actual,
    default: {
      ...actual.default,
      compare: vi.fn(),
      hash: vi.fn(),
    },
  };
});


beforeAll(async () => {
  pool = await getPool(); // Adjust the tenant name as needed
});

afterAll(async () => {
  await pool.end();
});

describe('User Resolver Integration Tests', () => {
  it('should fetch a user by ID', async () => {
    const context = { pool };
    const args = { id: 1 };

    const result = await userResolver.Query.user(null, args, context);

    expect(result).toBeDefined();
    expect(result.id).toBe(args.id);
  });

  it('should fetch all users', async () => {
    const context = { pool };

    const result = await userResolver.Query.allUser(null, {}, context);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should login a user with valid credentials', async () => {
    const context = { pool };
    const args = { username: 'test_user', password: 'test_password' };

    const result = await userResolver.Mutation.login(null, args, context);

    expect(result).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.timeout).toBeDefined();
  });

  it('should throw an error for invalid login credentials', async () => {
    const context = { pool };
    const args = { username: 'invalid_user', password: 'wrong_password' };

    await expect(userResolver.Mutation.login(null, args, context)).rejects.toThrow('User not found');
  });

  it('should add a new user', async () => {
    const context = { pool };
    const input = {
      username: 'new_user',
      password: 'new_password',
      nama: 'New User',
      has_account: true,
      roles: 'user',
    };

    const result = await userResolver.Mutation.addUser(null, { input }, context);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.username).toBe(input.username);
  });

  it('should update an existing user', async () => {
    const context = { pool };
    const input = {
      username: 'updated_user',
      nama: 'Updated User',
      has_account: true,
      roles: 'admin',
    };

    const result = await userResolver.Mutation.updateUser(null, { id: 1, input }, context);

    expect(result).toBeDefined();
    expect(result.affectedRows).toBeGreaterThan(0);
  });
});