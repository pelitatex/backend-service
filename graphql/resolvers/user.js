import dotenv from "dotenv";
dotenv.config();

import md5 from "../../helpers/md5.js";
import jwt from "../../helpers/jwt.js";
import bcrypt from "bcrypt";


const env = process.env.NODE_ENV || 'TEST';
const LIFETIME = process.env[`TOKEN_LIFETIME_${env}`];

const userResolver = {
  Query : {
    user: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        try {
            console.log(args);
            const query = `SELECT * FROM nd_user WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error User Single");
        }
    },
    allUser: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
      try {
        const query = 'SELECT * FROM nd_user';
        const [rows] = await pool.query(query);
        return rows;
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error User All");
      }
    },
  },
  Mutation:{
    login: async(_,{username,password}, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
      if (!password) {
        throw new Error('Password is required.');
      }
      try {
        const query = `SELECT * FROM nd_user WHERE username = ? and has_account = 1`;
        const [rows] = await pool.query(query, [username]);
        
        if (typeof rows[0] !== 'undefined') {
          const result = await bcrypt.compare(password, rows[0].password);
          if (!result) {
            throw new Error("User and password not match");
          }else{
            const user = rows[0];
            
            if (!user.status_aktif) {
              throw new Error ("User is inactive.");
            }

            const payload = {
              id: user.id,
              username: user.username,
              posisi_id: user.posisi_id,
              time_start: user.time_start,
              time_end: user.time_end
            };
            const token = jwt.generateToken(payload);
            return { token: token, timeout: LIFETIME };
            
          }
          
          
        }else{
          throw new Error("User not found");
        }

      } catch (error) {
        console.error(error);
        throw new Error(error.message);
      }
    }
    ,addUser: async(_, {input}, context) => {
      let { username, password, posisi_id, time_start, time_end, status_aktif,
        has_account, nama, alamat, telepon, jenis_kelamin, 
        kota_lahir, tgl_lahir, status_perkawinan, jumlah_anak, agama, nik, npwp } = input;

      let hashedPassword = null;

      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
      if (!nama || nama.trim() === '') {
        throw new Error('Nama is required.');
      }

      if(!has_account){status_aktif=0}
      else{
        if (status_aktif == null) {
          throw new Error('Status aktif is required.');          
        }

        if (!username || username.trim() === '') {
          throw new Error('Password is required.');
        }
        if (!password || password.trim() === '') {
          throw new Error('Password is required.');
        }

        if (time_start == null || time_end == null || time_start=='' || time_end == '') {
          time_start="07:00:00";
          time_end="18:00:00";
        }
        
        

        try {
          const checkUserExistenceQuery = `SELECT * FROM nd_user WHERE username = ?`;
          const [existingUserRows] = await pool.query(checkUserExistenceQuery, [username]);
          // kenapa ini tidak harus di catch ? karena ini adalah asyncronous code
          if (existingUserRows.length > 0) {
            throw new Error('User already exists.');
          }
          
        } catch (error) {
          throw new Error(error.message);
        }

        hashedPassword = await bcrypt.hash(password, 10);

      }

      

      try {
        const query = `INSERT INTO nd_user 
        (username, password, posisi_id, time_start, time_end,
        status_aktif, has_account, nama, alamat, telepon, jenis_kelamin,
        kota_lahir, tgl_lahir, status_perkawinan, jumlah_anak, agama, nik, npwp)
        VALUES (?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await pool.query(query, [username, hashedPassword, posisi_id, time_start, time_end, status_aktif,
          has_account, nama, alamat, telepon, jenis_kelamin,
          kota_lahir, tgl_lahir, status_perkawinan, jumlah_anak, agama, nik, npwp
        ]);
        const insertedUserId = result.insertId;
        return { id: insertedUserId, username, password:hashedPassword, posisi_id, time_start, time_end, status_aktif,
          has_account, nama, alamat, telepon, jenis_kelamin,
          kota_lahir, tgl_lahir, status_perkawinan, jumlah_anak, agama, nik, npwp
         };
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Insert User");
      }
    },
    updateUser: async(_, { id, input }, context) => {
      let { username, password, posisi_id, time_start, time_end, status_aktif,
        has_account, nama, alamat, telepon, jenis_kelamin, 
        kota_lahir, tgl_lahir, status_perkawinan, jumlah_anak, agama, nik, npwp
       } = input;

      let hashedPassword = null;

      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      if (!nama || nama.trim() === '') {
        throw new Error('Nama is required.');
      }

      if(!has_account){status_aktif=0}
      else{
        if (status_aktif == null) {
          throw new Error('Status aktif is required.');          
        }
        if (!username) {
          throw new Error('Username is required.');
        }
        if (!password) {
          throw new Error('Password is required.');
        }

        if (time_start == null || time_end == null || time_start=='' || time_end == '') {
          time_start="07:00:00";
          time_end="18:00:00";
        }

        try {
          const checkUsernameQuery = `SELECT * FROM nd_user WHERE username = ? AND id != ?`;
          const [existingUserRows] = await pool.query(checkUsernameQuery, [username, id]);
          if (existingUserRows.length > 0) {
            console.log(`SELECT * FROM nd_user WHERE username = ${username} AND id != ${id}`);
            throw new Error('Username is already taken.');
          }
          
        } catch (error) {
          throw new Error(error.message);
        }
        

        hashedPassword = await bcrypt.hash(password, 10);

      }

      try {

        const query = `UPDATE nd_user SET username = ?, password = ?, posisi_id = ?, time_start = ?, time_end = ?, status_aktif = ?,
        has_account = ?, nama = ?, alamat = ?, telepon = ?, jenis_kelamin = ?,
        kota_lahir = ?, tgl_lahir = ?, status_perkawinan = ?, jumlah_anak = ?, agama = ?, nik = ?, npwp = ?
        WHERE id = ?`;
        const [result] = await pool.query(query, [username, hashedPassword, posisi_id, time_start, time_end, status_aktif, 
          has_account, nama, alamat, telepon, jenis_kelamin,
          kota_lahir, tgl_lahir, status_perkawinan, jumlah_anak, agama, nik, npwp, id]);
        if (result.affectedRows === 0) {
          throw new Error("User not found");
        }
        return { id, username, password, posisi_id, time_start, time_end, status_aktif,
          has_account, nama, alamat, telepon, jenis_kelamin,
          kota_lahir, tgl_lahir, status_perkawinan, jumlah_anak, agama, nik, npwp

         };
      } catch (error) {
        console.error(error);
        throw new Error(error.message);
      }
    },
  },
}

export default userResolver;