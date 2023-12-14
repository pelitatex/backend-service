import DataLoader from "dataloader";

export const createSatuanLoader = (pool) => new DataLoader(async(ids)=>{
    console.log("Executing satuanLoader batch function...");
    // const pool = await getPoolForRequest(req);
    try {
        const query = `SELECT * FROM nd_satuan WHERE id IN (?)`;
        const res = await pool.query(query, ids); 
        const satuans = res[0];
        const satuanMap = new Map();
        satuans.map((satuan)=>{
            satuanMap.set((satuan.id).toString(),satuan);
        });
        const result = ids.map((id)=>satuanMap.get(id.toString()));
        console.log(result);
        return result;        
    } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Satuan Loader");
    }
});
  