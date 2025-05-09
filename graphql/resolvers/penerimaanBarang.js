import { queryLogger } from "../../helpers/queryTransaction.js";
// import { queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";
import { NODE2_URL } from "../../config/loadEnv.js";
import axios from "axios";

const getAlias = async (context, id) => {
  try {
    const pool = context.pool;
    const query = `SELECT * FROM nd_toko WHERE id = ?`;
    const [rows] = await pool.query(query, [id]);
    return rows[0].alias;
  } catch (error) {
    console.error("Error fetching toko:", error);
    throw new Error("Failed to fetch toko data");
    
  }
}

const penerimaanBarangResolver = {
  Query:{
    penerimaanBarang: handleResolverError(async(_,args, context)=>{ 
      const alias = await getAlias(context, args.toko_id);
      const otherAppUrl = `${NODE2_URL}/penerimaan_barang_by_id/${alias}`;
      let rows = await axios.get(otherAppUrl,{params: {id: args.id}});

      const responseData = rows?.data?.data || {};
  
      // Transform into the expected format

      const transformedData = {
        id: responseData.id || 0,
        tanggal: responseData.tanggal || '',
        no_plat: responseData.no_plat || '',
        jam_input: responseData.jam_input || '',
        daftarBarang: responseData.daftarBarang || [],
      };
      
      return transformedData;
    }),
    
    penerimaanBarangByTanggal: handleResolverError(async(_,args, context)=>{
      const alias = await getAlias(context, args.toko_id);
      const otherAppUrl = `${NODE2_URL}/penerimaan_barang_by_tanggal/${alias}`;
      let rows = await axios.get(otherAppUrl,{params: {tanggal_start: args.tanggal_start, tanggal_end: args.tanggal_end}});
      
      const responseData = rows?.data?.data || [];
  
      // Transform into the expected format

      const transformedData =  responseData.map((item) =>{
        return {
          id: item.id || 0,
          tanggal: item.tanggal || '',
          no_plat: item.no_plat || '',
          jam_input: item.jam_input || '',
          daftarBarang: item.daftarBarang || [],
        };
      });

      return transformedData;

    })
  },
  Mutation: {
    confirmPenerimaanBarang: handleResolverError(async (_, {id, input}, context) => {
      const alias = await getAlias(context, args.toko_id);
      const otherAppUrl = `${NODE2_URL}/penerimaan_barang_konfirmasi/${alias}`;
      let rows = await axios.put(otherAppUrl,{params: {id:id, confirmationStatus: input.confirmationStatus}});
      return rows;

    }),
  }
}

export default penerimaanBarangResolver;