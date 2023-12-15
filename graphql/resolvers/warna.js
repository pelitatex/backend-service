const warnaResolver = {
  Query : {
    warna: async(_,args, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
        try {
            const query = `SELECT * FROM nd_warna WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Warna Single");
        }
    },
    allWarna: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }

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