import db_con from "../../helpers/db_middleware.js";

const getBarang = {
    barang: async(args, req)=>{
        try {
            const query = `SELECT * FROM nd_barang WHERE id = ?`;
            const values = [args.id];
            return new Promise((resolve, reject) => {
              db_con.query(query, values, (err, results) => {
                  if (err) {
                    console.error('Error executing MySQL query: ' + err);
                    reject('Error fetching barang data');
                  } else {
                    resolve(results[0]);
                  }
                });
            });
        } catch (error) {
            
        }
    },
    barangs: async()=>{
        try {
            const query = 'SELECT * FROM nd_barang';
            return new Promise((resolve, reject) => {
                db_con.query(query, (err, results) => {
                  if (err) {
                    console.error('Error executing MySQL query: ' + err);
                    reject('Error fetching barang data');
                  } else {
                    resolve(results);
                  }
                });
            });
        } catch (error) {
            
        }
    }
}

export default getBarang;