import getPoolForRequest from "../../config/mysqlCon.js";

const getSupplier = {
    supplier: async(args, req)=>{
      const pool = getPoolForRequest(req);
        try {
            const query = `SELECT * FROM nd_supplier WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Supplier Single");
        }
    },
    suppliers: async(args, req)=>{
      const pool = getPoolForRequest(req);

        try {
            const query = 'SELECT * FROM nd_supplier';
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Supplier All");
        }
    }
}

export default getSupplier;