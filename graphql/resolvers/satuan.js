const satuanResolver = {
  Query:{
    satuan: async(_,args, context)=>{
      if (!context.loader.satuanLoader) {
        throw new Error("satuan loader is null");
      } 
      return context.loader.satuanLoader.load(args.id)
    },
    allSatuan: async(_,args, context)=>{
      try {
        const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
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