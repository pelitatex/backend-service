import request from 'supertest';
import app from '../../index.js';
import { getPool, setPool } from '../../utils/poolManager.js';

let server;
let pool;

beforeAll(async () => {
  
});

describe('userResolver', () => {
  let userId = 1;
  let nUserId = 0;

  beforeAll(async () => {
    // Insert test data for users
    /* const [userResult] = await pool.query(
      'INSERT INTO nd_user (username, password, nama, roles, status_aktif, has_account) VALUES (?, ?, ?, ?, ?, ?)',
      ['test_user', 'hashed_password', 'Test User', 'SUPERADMIN', 1, 1]
    ); */
    // userId = userResult.insertId;

    await setPool('default');
    pool = await getPool();
    server = app;

  });

  afterAll(async () => {
    try {
      // Log rows before 
      
      await pool.query("START TRANSACTION");
      const [rows] = await pool.query("SELECT * FROM nd_user WHERE id >= 3");
      console.log("Rows to delete:", rows);

      // Attempt to delete rows
      const [deleteResult] = await pool.query("DELETE FROM nd_user WHERE id >= 3");
      console.log("Delete Result:", deleteResult);

      // Verify rows after deletion
      const [verifyRows] = await pool.query("SELECT * FROM nd_user WHERE id >= 3");
      await pool.query("COMMIT");
      console.log("Rows remaining after deletion:", verifyRows);
    } catch (error) {
      console.error("Error during afterAll cleanup:", error);
    } finally {
      await pool.end();
    }
  });

  it('should fetch user by ID', async () => {
    const query = `
      query GetUser($id: Int!) {
        user(id: $id) {
          id
          username
          nama
          roles
        }
      }
    `;
    const variables = { id: userId };

    const response = await request(server)
      .post('/graphql')
      .send({ query, variables });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toEqual({
      id: userId.toString(),
      username: 'test_user',
      nama: 'Test User',
      roles: 'SUPERADMIN',
    });
  });

  it('should fetch all users', async () => {
    const query = `
      query GetAllUsers {
        allUser {
          id
          username
          nama
          roles
        }
      }
    `;

    const response = await request(server).post('/graphql').send({ query });

    expect(response.status).toBe(200);
    expect(response.body.data.allUser).toContainEqual({
      id: userId.toString(),
      username: 'test_user',
      nama: 'Test User',
      roles: 'SUPERADMIN',
    });
  });

  it('should add a new user and fetch it', async () => {
    const mutation = `
      mutation AddUser($input: AddUserInput!) {
        addUser(input: $input) {
          id
          username
          nama
          roles
        }
      }
    `;
    const variables = {
      input: {
        username: 'new_user',
        password: 'password123',
        nama: 'New User',
        roles: 'SUPERADMIN',
        status_aktif: true,
        has_account: true,
      },
    };

    const addResponse = await request(server)
      .post('/graphql')
      .send({ query: mutation, variables });

    expect(addResponse.status).toBe(200);
    const newUser = addResponse.body.data.addUser;
    expect(newUser.id).toBeDefined();
    expect(newUser.username).toBe('new_user');
    expect(newUser.nama).toBe('New User');
    expect(newUser.roles).toBe('SUPERADMIN');

    console.log("New User ID:", newUser.id); // Debugging log

    // Attempt to delete the newly added user
    const deleteQuery = 'DELETE FROM nd_user WHERE id = ?';
    const [deleteResult] = await pool.query(deleteQuery, [newUser.id]);

    console.log(`Delete Result ${newUser.id}:`, deleteResult); // Debugging log

    // Verify the user was deleted
    const verifyQuery = 'SELECT * FROM nd_user WHERE id = 11';
    const [verifyResult] = await pool.query(verifyQuery, [newUser.id]);

    nUserId = newUser.id; // Store the new user ID for later use
    console.log("Verify Result:", verifyResult); // Debugging log
    expect(verifyResult.length).toBe(0); // Ensure the user is deleted
  });

  it('should log in a user and return a token', async () => {
    const mutation = `
      mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          token
          timeout
        }
      }
    `;
    const variables = { username: 'new_user_test', password: 'password123' };

    const response = await request(server)
      .post('/graphql')
      .send({ query: mutation, variables });

    expect(response.status).toBe(200);
    expect(response.body.data.login.token).toBeDefined();
    expect(response.body.data.login.timeout).toBeDefined();
  });
});
