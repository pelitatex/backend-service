import db from "../../config/db.js";
import md5 from "../../helpers/md5.js";
import jwt from "../../helpers/jwt.js";

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
          const user = await new Promise((resolve, reject) => {
              db.query(query, [username], (err, results) => {
                if (err) {
                  console.error('Error executing MySQL query: ' + err);
                  reject(new Error('Error executing login user'));
                  return;
                } else if(results.length === 0) {
                    reject(new Error('User not found'));
                    return;
                } else {
                  const resUser = results[0];
                  const isPasswordValid = (md5.generateMD5(password) === resUser.password ? true : false);
                  if (isPasswordValid) {
                    resolve(resUser);
                  }else{
                    reject(new Error('User and password not match'));
                  }
                }
              });
          });
          if (user) {
            const payload = {
              id:user.id,
              username: user.username,
              posisi_id: user.posisi_id,
              time_start: user.time_start,
              time_end: user.time_end
            }
            const token = jwt.generateToken(payload);
            return {token: token};
          }
          return {token:null};
      } catch (error) {
        console.error(error);
        throw new Error('Login failed', error);
      }
  },
}

export default getUser;