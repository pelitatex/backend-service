import getPoolForRequest from "../../config/mysqlCon.js";
const checkPool = (req) => {
  const pool = getPoolForRequest(req);
  if (!pool) {
    console.error('Invalid or missing tenant information.');
    throw new Error("No connection to database");
  }
  return pool;
}

const getSupplier = {
    supplier: async(args, req)=>{
      const pool = checkPool(req);
        try {
            const query = `SELECT * FROM nd_supplier WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Supplier Single");
        }
    },
    suppliers: async()=>{
      const pool = checkPool(req);

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