import getPoolForRequest from "../../config/mysqlCon.js";

const getCustomer = {
    customer: async(args, req)=>{
      const pool = getPoolForRequest(req);
        try {
            const query = `SELECT * FROM nd_customer WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Customer All");
        }
    },
    customers: async()=>{
      const pool = getPoolForRequest(req);
        try {
          const query = 'SELECT * FROM nd_customer';
          const [rows] = await pool.query(query);
          return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Customer All");
        }
    }
}

export default getCustomer;