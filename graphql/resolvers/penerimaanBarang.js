import { queryLogger } from "../../helpers/queryTransaction.js";
// import { queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";
import { NODE2_URL } from "../../config/loadEnv.js";
import axios from "axios";
import { response } from "express";

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
        tanggal_input: responseData.tanggal_input || '',
        daftar_barang: responseData.daftarBarang || [],
      };
      
      return transformedData;
    }),
    
    penerimaanBarangByTanggal: handleResolverError(async(_,args, context)=>{
      const alias = await getAlias(context, args.toko_id);
      const otherAppUrl = `${NODE2_URL}/penerimaan_barang_by_tanggal/${alias}`;
      let rows = await axios.get(otherAppUrl,{params: {tanggal_start: args.tanggal_start, tanggal_end: args.tanggal_end}});

      const responseData = rows?.data?.data || [];

      
      // Transform into the expected format
      
      console.log("responseData", responseData);
      const transformedData =  responseData?.penerimaanBarang.map((item) =>{
        console.log("daftarBarang", item.daftarBarang);
        return {
          id: item.penerimaan_barang_id || 0,
          tanggal_input: item.tanggal_input || '',
          no_plat: item.no_plat || '',
          daftar_barang: item.daftarBarang || [],
        };
      });

        console.log("transformedData", transformedData);
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