import getPoolForRequest from "../../config/mysqlCon.js";
import { createSatuanLoader } from "./loader.js";

const skuBarangResolver = {
  Query:{
    skuBarang: async(args, req)=>{
      const pool = getPoolForRequest(req);
        try {
          const query = `SELECT * FROM nd_sku_barang WHERE id = ?`;
          const [rows] = await pool.query(query, [args.id]);
          return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Barang Single");
        }
    },
    skuBarangs: async(args, req)=>{
      const pool = getPoolForRequest(req);
        try {
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
    satuan: async(parent, args, context)=>{
      const satuanLoader = context.satuanLoader || createSatuanLoader(context.req)
      return satuanLoader.load(parent.satuan_id)
    },
  }
}

export default skuBarangResolver;