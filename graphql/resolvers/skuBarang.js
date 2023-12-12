import getPoolForRequest from "../../config/mysqlCon.js";
import DataLoader from "dataloader";

const satuanLoader = new DataLoader(async(ids)=>{
  const query = `SELECT * FROM nd_sku_barang WHERE id IN (?)`;
  const satuans = await pool.query(query, [ids]);
  const satuanMap = new Map(satuans.map((satuan)=>[satuan.id,satuan]));
  return ids.map((id)=>satuanMap.get(id));
});

const skuBarangResolver = {
  Query:{
    barang: async(args, req)=>{
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
    barangs: async(args, req)=>{
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
  Barang:{
    satuan: async(parent)=>{
      return satuanLoader(parent.satuan_id)
    },
  }
}

export default skuBarangResolver;