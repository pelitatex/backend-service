
const supplierResolver = {
  Query:{
    supplier: async(_,args, context)=>{
      // const pool = getPoolForRequest(req);
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }

        try {
            const query = `SELECT * FROM nd_supplier WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Supplier Single");
        }
    },
    suppliers: async(_,args, req)=>{
      // const pool = getPoolForRequest(req);
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }

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
}

export default supplierResolver;