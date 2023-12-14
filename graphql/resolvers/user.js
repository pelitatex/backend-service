import dotenv from "dotenv";
dotenv.config();

import md5 from "../../helpers/md5.js";
import jwt from "../../helpers/jwt.js";


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
    users: async(_,args, context)=>{
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
      try {
        const query = `SELECT id, username, password, posisi_id, time_start, time_end FROM nd_user WHERE username = ?`;
        const [rows] = await pool.query(query, [username]);
        if (typeof rows[0] !== 'undefined') {
          const isPasswordValid = md5.generateMD5(password) === rows[0].password;
          if (isPasswordValid) {
            const user = rows[0];
            const payload = {
              id:user.id,
              username: user.username,
              posisi_id: user.posisi_id,
              time_start: user.time_start,
              time_end: user.time_end
            }
            const token = jwt.generateToken(payload);
            return {token: token, timeout: LIFETIME};
          } else {
            throw new Error("User and password not match'");
          }
        }else{
          throw new Error("User and password not match'");
        }

      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Login Process");
      }
    }
  },
}

export default userResolver;