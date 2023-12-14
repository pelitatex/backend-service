const skuBarangResolver = {
  Query:{
    skuBarang: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        try {
          const query = `SELECT * FROM nd_sku_barang WHERE id = ?`;
          const [rows] = await pool.query(query, [args.id]);
          return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Barang Single");
        }
    },
    skuBarangs: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        try {
          const query = 'SELECT * FROM nd_sku_barang';
          const [rows] = await pool.query(query);
          console.log('47',rows[47]);
          return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Barang All");
        }
    }
  },
  SKUBarang:{
    satuan: async(parent, _, context)=>{
      if (!context.loader.satuanLoader) {
        throw new Error("satuan loader is null");
      }

      if (!parent.satuan_id) {
        return'aneh';
      }
      return context.loader.satuanLoader.load(parent.satuan_id);
    },
  }
}

export default skuBarangResolver;