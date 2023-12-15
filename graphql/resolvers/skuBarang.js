const skuBarangResolver = {
  Query:{
    skuBarang: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        try {
          context.useSatuanLoader = true;
          const query = `SELECT * FROM nd_sku_barang WHERE id = ?`;
          const [rows] = await pool.query(query, [args.id]);
          return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Barang Single");
        }
    },
    allSkuBarang: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        try {
          context.useSatuanLoader = false;
          const query = 'SELECT * FROM nd_sku_barang';
          const [rows] = await pool.query(query);
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
      if (context.useSatuanLoader) {
        return context.loader.satuanLoader.load(parent.satuan_id);
      } else {
        const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        try {
          const query = 'SELECT * FROM nd_satuan';
          const [rows] = await pool.query(query);
          const satuan = rows.find((satuan) => satuan.id === parent.satuan_id);
          return satuan;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Satuan All");
        }        
      }
    },
  }
}

export default skuBarangResolver;