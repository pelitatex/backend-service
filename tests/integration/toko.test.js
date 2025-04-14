import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import mysql from 'mysql2/promise';
import app from '../../app.js'; // Adjust the path to your app entry point

let pool;

beforeAll(async () => {
  pool = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password', // Replace with your MySQL password
    database: 'test_db',  // Replace with your test database
  });

  // Seed the database with test data
  await pool.query(`
    CREATE TABLE IF NOT EXISTS nd_toko (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(255),
      alamat TEXT,
      telepon VARCHAR(20),
      email VARCHAR(255),
      kota VARCHAR(100),
      kode_pos VARCHAR(10),
      npwp VARCHAR(20),
      kode_toko VARCHAR(50),
      status_aktif BOOLEAN,
      nama_domain VARCHAR(255),
      email_pajak VARCHAR(255)
    );
  `);

  await pool.query(`
    INSERT INTO nd_toko (nama, alamat, telepon, email, kota, kode_pos, npwp, kode_toko, status_aktif, nama_domain, email_pajak)
    VALUES ('Toko A', 'Alamat A', '123456789', 'tokoA@example.com', 'Kota A', '12345', '1234567890', 'KODEA', true, 'domainA.com', 'pajakA@example.com');
  `);
});

afterAll(async () => {
  // Clean up the database
  await pool.query('DROP TABLE IF EXISTS nd_toko');
  await pool.end();
});

describe('Toko Resolver Integration Tests', () => {
  it('should fetch a toko by ID', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          query GetToko($id: Int!) {
            toko(id: $id) {
              id
              nama
              alamat
              telepon
              email
              kota
              kode_pos
              npwp
              kode_toko
              status_aktif
              nama_domain
              email_pajak
            }
          }
        `,
        variables: { id: 1 },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.toko).toMatchObject({
      id: 1,
      nama: 'Toko A',
      alamat: 'Alamat A',
      telepon: '123456789',
      email: 'tokoA@example.com',
      kota: 'Kota A',
      kode_pos: '12345',
      npwp: '1234567890',
      kode_toko: 'KODEA',
      status_aktif: true,
      nama_domain: 'domainA.com',
      email_pajak: 'pajakA@example.com',
    });
  });

  it('should add a new toko', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation AddToko($input: TokoInput!) {
            addToko(input: $input) {
              id
              nama
              alamat
              telepon
              email
              kota
              kode_pos
              npwp
              kode_toko
              status_aktif
              nama_domain
              email_pajak
            }
          }
        `,
        variables: {
          input: {
            nama: 'Toko B',
            alamat: 'Alamat B',
            telepon: '987654321',
            email: 'tokoB@example.com',
            kota: 'Kota B',
            kode_pos: '54321',
            npwp: '0987654321',
            kode_toko: 'KODEB',
            status_aktif: true,
            nama_domain: 'domainB.com',
            email_pajak: 'pajakB@example.com',
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.addToko).toMatchObject({
      nama: 'Toko B',
      alamat: 'Alamat B',
      telepon: '987654321',
      email: 'tokoB@example.com',
      kota: 'Kota B',
      kode_pos: '54321',
      npwp: '0987654321',
      kode_toko: 'KODEB',
      status_aktif: true,
      nama_domain: 'domainB.com',
      email_pajak: 'pajakB@example.com',
    });
  });

  it('should update an existing toko', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation UpdateToko($id: Int!, $input: TokoInput!) {
            updateToko(id: $id, input: $input) {
              id
              nama
              alamat
              telepon
              email
              kota
              kode_pos
              npwp
              kode_toko
              status_aktif
              nama_domain
              email_pajak
            }
          }
        `,
        variables: {
          id: 1,
          input: {
            nama: 'Toko A Updated',
            alamat: 'Alamat A Updated',
            telepon: '111222333',
            email: 'updatedA@example.com',
            kota: 'Kota A Updated',
            kode_pos: '67890',
            npwp: '1112223330',
            kode_toko: 'KODEA1',
            status_aktif: false,
            nama_domain: 'updatedA.com',
            email_pajak: 'updatedPajakA@example.com',
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.updateToko).toMatchObject({
      id: 1,
      nama: 'Toko A Updated',
      alamat: 'Alamat A Updated',
      telepon: '111222333',
      email: 'updatedA@example.com',
      kota: 'Kota A Updated',
      kode_pos: '67890',
      npwp: '1112223330',
      kode_toko: 'KODEA1',
      status_aktif: false,
      nama_domain: 'updatedA.com',
      email_pajak: 'updatedPajakA@example.com',
    });
  });
});
