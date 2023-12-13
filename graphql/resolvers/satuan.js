import { createSatuanLoader } from "./loader.js";

const satuanResolver = {
  Query:{
    satuan: async(args, req, context)=>{
      const satuanLoader = context.satuanLoader || createSatuanLoader(req)
      return satuanLoader.load(args.id)
    },
    satuans: async(args, req, context)=>{
      const pool = getPoolForRequest(req);

        try {
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