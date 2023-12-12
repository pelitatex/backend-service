import getPoolForRequest from "../../config/mysqlCon.js";

const warnaResolver = {
  Query:{
    warna: async(args, req)=>{
      const pool = getPoolForRequest(req);
        try {
            const query = `SELECT * FROM nd_warna WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Warna Single");
        }
    },
    warnas: async(args, req)=>{
      const pool = getPoolForRequest(req);

        try {
            const query = 'SELECT * FROM nd_warna';
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Warna All");
        }
    }
  }
}

export default warnaResolver;