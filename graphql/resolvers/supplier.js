import db from "../../config/db.js";

const getSupplier = {
    supplier: async(args, req)=>{
        try {
            const query = `SELECT * FROM nd_supplier WHERE id = ?`;
            const values = [args.id];
            return new Promise((resolve, reject) => {
                db.query(query, values, (err, results) => {
                  if (err) {
                    console.error('Error executing MySQL query: ' + err);
                    reject('Error fetching supplier data');
                  } else {
                    resolve(results[0]);
                  }
                });
            });
        } catch (error) {
            
        }
    },
    suppliers: async()=>{
        try {
            const query = 'SELECT * FROM nd_supplier';
            return new Promise((resolve, reject) => {
                db.query(query, (err, results) => {
                  if (err) {
                    console.error('Error executing MySQL query: ' + err);
                    reject('Error fetching supplier data');
                  } else {
                    resolve(results);
                  }
                });
            });
        } catch (error) {
            
        }
    }
}

export default getSupplier;