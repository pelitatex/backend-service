import db from "../../config/db.js";
import md5 from "../../helpers/md5.js";
import jwt from "../../helpers/jwt.js";
import db_con from "../../helpers/db_middleware.js";

const getUser = {
    user: async(args, req)=>{
        try {
            const query = `SELECT * FROM nd_user WHERE id = ?`;
            const values = [args.id];
            return new Promise((resolve, reject) => {
                db.query(query, values, (err, results) => {
                  if (err) {
                    console.error('Error executing MySQL query: ' + err);
                    reject('Error fetching user data');
                  } else {
                    resolve(results[0]);
                  }
                });
            });
        } catch (error) {
            
        }
    },
    users: async()=>{
        try {
            const query = 'SELECT * FROM nd_user';
            return new Promise((resolve, reject) => {
                db.query(query, (err, results) => {
                  if (err) {
                    console.error('Error executing MySQL query: ' + err);
                    reject('Error fetching user data');
                  } else {
                    resolve(results);
                  }
                });
            });
        } catch (error) {
            
        }
    },
    login: async({username,password}, req)=>{
      try {
        const query = `SELECT id, username, password, posisi_id, time_start, time_end FROM nd_user WHERE username = ?`;
        const [rows] = await db_con.execute(query, [username]);
        const isPasswordValid = (md5.generateMD5(password) === rows.password ? true : false);
        if (isPasswordValid) {
          return rows;
        }else{
          reject(new Error('User and password not match'));
        }

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  },
}

export default getUser;