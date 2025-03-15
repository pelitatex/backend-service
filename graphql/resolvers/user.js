import {LIFETIME} from "../../config/loadEnv.js";
import jwt from "../../helpers/jwt.js";
import bcrypt from "bcrypt";
import { queryLogger, queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const userResolver = {
  Query : {
    user: handleResolverError(async(_,args, context)=>{
      const query = `SELECT * FROM nd_user WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
    }),
    allUser: handleResolverError(async(_,args, context)=>{
      const query = 'SELECT * FROM nd_user';
      const [rows] = await pool.query(query);
      return rows;
    }),
  },
  Mutation:{
    login: handleResolverError(async(_,{username,password}, context)=>{
        
      if (!password) {
        throw new Error('Password is required.');
      }
      if (!username) {
        throw new Error('Username is required.');
      }
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
            roles: user.roles,
            posisi_id: user.posisi_id,
            time_start: user.time_start,
            time_end: user.time_end
          };
          const token = jwt.generateToken(payload);

          const queryLog = `INSERT INTO user_log (user_id, activity) VALUES (?, ?)`;
          const [res] = await pool.query(queryLog, [user.id, 'login']);
          return { token: token, timeout: LIFETIME };
          
        }
        
        
      }else{
        throw new Error("User not found");
      }
    }),
    pinChecker: handleResolverError(async(_,{input}, context)=>{
      const {pin} = input;
      if (!pin) {
        throw new Error('PIN is required.');
      }
      const query = `SELECT * FROM nd_user WHERE pin = ? and has_account = 1 and status_aktif = 1`;
      const [rows] = await pool.query(query, [pin]);
      
      if (typeof rows[0] !== 'undefined') {
        return {
          id: rows[0].id,
          has_account: rows[0].has_account,
          nama: rows[0].nama,
          username: rows[0].username,
          posisi_id: rows[0].posisi_id,
          time_start: rows[0].time_start,
          time_end: rows[0].time_end,
          status_aktif: rows[0].status_aktif
        }         
        
      }else{
        throw new Error("User not found");
      }
    }),
    addUser: handleResolverError(async(_, {input}, context) => {
      let { username, password, posisi_id, roles, time_start, time_end, status_aktif,
        has_account, nama, alamat, telepon, jenis_kelamin, 
        kota_lahir, tgl_lahir, status_perkawinan, jumlah_anak, agama, nik, npwp } = input;

      let hashedPassword = null;

      if (!nama || nama.trim() === '') {
        throw new Error('Nama is required.');
      }

      if(!has_account){
        status_aktif=0;
      }
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
        if (!roles || roles.trim() === '') {
          throw new Error('Roles is required.');
        }

        if (time_start == null || time_end == null || time_start=='' || time_end == '') {
          time_start="07:00:00";
          time_end="18:00:00";
        }
                

        hashedPassword = await bcrypt.hash(password, 10);

      }      

      const query = `INSERT INTO nd_user 
      (username, password, posisi_id, roles,time_start, time_end,
      status_aktif, has_account, nama, alamat, telepon, jenis_kelamin,
      kota_lahir, tgl_lahir, status_perkawinan, jumlah_anak, agama, nik, npwp)
      VALUES (?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?)`;

      const params =[username, hashedPassword, posisi_id, roles, time_start, time_end, status_aktif,
        has_account, nama, alamat, telepon, jenis_kelamin,
        kota_lahir, tgl_lahir, status_perkawinan, jumlah_anak, agama, nik, npwp
      ];

      const [result] = await pool.query(query, params);
      if(result.affectedRows === 0){
        throw new Error("Failed to insert user");
      }
      queryLogger(pool, 'nd_user', result.insertId, query, params);
      
      return { ...input, id: result.insertId };
      
    }),
    updateUser: handleResolverError(async(_, { id, input }, context) => {
      let { username, password, posisi_id, roles,time_start, time_end, status_aktif,
        has_account, nama, alamat, telepon, jenis_kelamin, 
        kota_lahir, tgl_lahir, status_perkawinan, jumlah_anak, agama, nik, npwp
       } = input;

      let hashedPassword = null;

      if (!nama || nama.trim() === '') {
        throw new Error('Nama is required.');
      }

      const getUsername = `SELECT username, password FROM nd_user WHERE id = ?`;
      const [rows] = await pool.query(getUsername, [id]);
      let usernameHistory = rows[0].username;
      let passwordHistory = rows[0].password;

      if(!has_account){
        status_aktif=0;
        username = usernameHistory;
        password = null;
      }
      else{
        if (status_aktif == null) {
          throw new Error('Status aktif is required.');          
        }
        if (!username) {
          throw new Error('Username is required.');
        }
        if (!password) {
          if (passwordHistory == null || passwordHistory == '') {
            throw new Error('Password is required.');
          }else{
            password = passwordHistory;
          }
        }
        if (!roles || roles.trim() === '') {
          throw new Error('Roles is required.');
        }

        if (time_start == null || time_end == null || time_start=='' || time_end == '') {
          time_start="07:00:00";
          time_end="18:00:00";
        }        

        hashedPassword = await bcrypt.hash(password, 10);

      }

      const query = `UPDATE nd_user SET username = ?, password = ?, posisi_id = ?, roles=?, time_start = ?, time_end = ?, status_aktif = ?,
      has_account = ?, nama = ?, alamat = ?, telepon = ?, jenis_kelamin = ?,
      kota_lahir = ?, tgl_lahir = ?, status_perkawinan = ?, jumlah_anak = ?, agama = ?, nik = ?, npwp = ?
      WHERE id = ?`;

      const params = [username, hashedPassword, posisi_id, roles,time_start, time_end, status_aktif, 
        has_account, nama, alamat, telepon, jenis_kelamin,
        kota_lahir, tgl_lahir, status_perkawinan, jumlah_anak, agama, nik, npwp, id];
      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }
      queryLogger(pool, 'nd_user', id, query, params);
      
      return result;
    }),
  },
}

export default userResolver;