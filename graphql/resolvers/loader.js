import getPoolForRequest from "../../config/mysqlCon.js";
import DataLoader from "dataloader";

export const createSatuanLoader = (req) => new DataLoader(async(ids)=>{
    const pool = getPoolForRequest(req);
    try {
        const query = `SELECT * FROM nd_sku_barang WHERE id IN (?)`;
        const satuans = await pool.query(query, [ids]);
        const satuanMap = new Map(satuans.map((satuan)=>[satuan.id,satuan]));
        return ids.map((id)=>satuanMap.get(id));        
    } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Satuan Loader");
    }
});
  