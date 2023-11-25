import db from "../../config/db.js";

const getCustomer = {
    customer: async(args, req)=>{
        try {
            const query = `SELECT * FROM nd_customer WHERE id = ?`;
            const values = [args.id];
            return new Promise((resolve, reject) => {
                db.query(query, values, (err, results) => {
                  if (err) {
                    console.error('Error executing MySQL query: ' + err);
                    reject('Error fetching customer data');
                  } else {
                    resolve(results[0]);
                  }
                });
            });
        } catch (error) {
            
        }
    },
    customers: async()=>{
        try {
            const query = 'SELECT * FROM nd_customer';
            return new Promise((resolve, reject) => {
                db.query(query, (err, results) => {
                  if (err) {
                    console.error('Error executing MySQL query: ' + err);
                    reject('Error fetching customer data');
                  } else {
                    resolve(results);
                  }
                });
            });
        } catch (error) {
            
        }
    }
}

export default getCustomer;