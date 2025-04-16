import request from 'supertest';
import app from '../../index.js';
import { getPool, setPool } from '../../utils/poolManager.js';

let server;
let pool;

beforeAll(async () => {
  await setPool('default');
  pool = await getPool();
  server = app;
  await pool.query("DELETE FROM users");
});

afterAll(async () => {
  await pool.end();
});

describe('userResolver', () => {
  let userId;

  beforeAll(async () => {
    // Insert test data for users
    const [userResult] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Test User', 'testuser@example.com', 'password123']
    );
    userId = userResult.insertId;
  });

  afterAll(async () => {
    // Cleanup test data
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
  });

  it('should fetch user by ID', async () => {
    const query = `
      query GetUser($id: Int!) {
        user(id: $id) {
          id
          name
          email
        }
      }
    `;
    const variables = { id: userId };

    const response = await request(server)
      .post('/graphql')
      .send({ query, variables });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toEqual({
      id: userId,
      name: 'Test User',
      email: 'testuser@example.com',
    });
  });

  it('should add a new user and fetch it', async () => {
    const mutation = `
      mutation AddUser($input: AddUserInput!) {
        addUser(input: $input) {
          id
          name
          email
        }
      }
    `;
    const variables = {
      input: { name: 'New User', email: 'newuser@example.com', password: 'password123' },
    };

    const addResponse = await request(server)
      .post('/graphql')
      .send({ query: mutation, variables });

    expect(addResponse.status).toBe(200);
    const newUser = addResponse.body.data.addUser;
    expect(newUser.id).toBeDefined();
    expect(newUser.name).toBe('New User');
    expect(newUser.email).toBe('newuser@example.com');

    // Cleanup the newly added user
    await pool.query('DELETE FROM users WHERE id = ?', [newUser.id]);
  });

  it('should fetch all users', async () => {
    const query = `
      query GetAllUsers {
        allUsers {
          id
          name
          email
        }
      }
    `;

    const response = await request(server).post('/graphql').send({ query });

    expect(response.status).toBe(200);
    expect(response.body.data.allUsers).toContainEqual({
      id: userId,
      name: 'Test User',
      email: 'testuser@example.com',
    });
  });
});
