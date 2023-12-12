import getPoolForRequest from "../../config/mysqlCon.js";

const satuanResolver = {
  Query:{
    satuan: async(args, req)=>{
      const pool = getPoolForRequest(req);
        try {
            const query = `SELECT * FROM nd_satuan WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Satuan Single");
        }
    },
    satuans: async(args, req)=>{
      const pool = getPoolForRequest(req);

        try {
            const query = 'SELECT * FROM nd_satuan';
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Satuan All");
        }
    }
  }
}

export default satuanResolver;