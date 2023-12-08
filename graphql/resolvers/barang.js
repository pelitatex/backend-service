import getPoolForRequest from "../../config/mysqlCon.js";

const checkPool = (req) => {
  const pool = getPoolForRequest(req);
  if (!pool) {
    console.error('Invalid or missing tenant information.');
    throw new Error("No connection to database");
  }
  return pool;
}

const getBarang = {
    barang: async(args, req)=>{
      const pool = checkPool(req);
        try {
          const query = `SELECT * FROM nd_barang WHERE id = ?`;
          const [rows] = await pool.query(query, [args.id]);
          return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Barang Single");
        }
    },
    barangs: async()=>{
      const pool = checkPool(req);
        try {
          const query = 'SELECT * FROM nd_barang';
          const [rows] = await pool.query(query);
          return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Barang All");
        }
    }
}

export default getBarang;