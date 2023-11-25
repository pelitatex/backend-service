import db from "../../config/db.js";

const getWarna = {
    warna: async(args, req)=>{
        try {
            const query = `SELECT * FROM nd_warna WHERE id = ?`;
            const values = [args.id];
            return new Promise((resolve, reject) => {
                db.query(query, values, (err, results) => {
                  if (err) {
                    console.error('Error executing MySQL query: ' + err);
                    reject('Error fetching warna data');
                  } else {
                    resolve(results[0]);
                  }
                });
            });
        } catch (error) {
            
        }
    },
    warnas: async()=>{
        try {
            const query = 'SELECT * FROM nd_warna';
            return new Promise((resolve, reject) => {
                db.query(query, (err, results) => {
                  if (err) {
                    console.error('Error executing MySQL query: ' + err);
                    reject('Error fetching warna data');
                  } else {
                    resolve(results);
                  }
                });
            });
        } catch (error) {
            
        }
    }
}

export default getWarna;