import { queryLogger } from "../../helpers/queryTransaction.js";
// import { queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";
import { NODE2_URL } from "../../config/loadEnv.js";

const penerimaanBarangResolver = {
  Query:{
    penerimaanBarangById: handleResolverError(async(_,args, context)=>{
      const otherAppUrl = `${NODE2_URL}/penerimaanBarang/${args.company_id}`;
      let rows = await axios.get(otherAppUrl,{params: {id: args.id}});
      return rows[0];
    }),
    penerimaanBarangByTanggal: handleResolverError(async(_,args, context)=>{
      
      const otherAppUrl = `${NODE2_URL}/penerimaanBarang/${args.company_id}`;
      let rows = await axios.get(otherAppUrl,{params: {tanggal_start: args.tanggal_start, tanggal_end: args.tanggal_end}});
      return rows;

    })
    
  }
}

export default penerimaanBarangResolver;