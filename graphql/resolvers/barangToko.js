import { sendToQueue } from "../../rabbitMQ/producers.js";
import { queryLogger } from "../../helpers/queryTransaction.js";
import { ENVIRONMENT } from "../../config/loadEnv.js";
import { assignBarangToko } from "../../rabbitMQ/barangSKUToko_producers.js";

import handleResolverError from "../handleResolverError.js";

const barangTokoResolver = {
  Query:{
    barangToko: handleResolverError(async(_,args, context)=>{
      const { pool } = context; 
      if (!args.toko_id) {
        throw new Error('Toko ID is required');
      }
      // context.useSatuanLoader = true;
      const query = `SELECT * FROM nd_toko_barang_assignment WHERE toko_id = ?`;
      const [rows] = await pool.query(query, [args.toko_id]);
      return rows[0];
      
    }),
    allBarangToko: handleResolverError(async(_,args, context)=>{
      const { pool } = context;
      // context.useSatuanLoader = false
      const query = 'SELECT * FROM nd_toko_barang_assignment';
      const [rows] = await pool.query(query);
      return rows;
    })
  },
  Mutation:{
    addBarangToko: async (_, {input}, context) => {
      const { pool } = context; 
      const {toko_id, barang_id} = input;
      let tokoAlias = "";

      if(ENVIRONMENT === 'development'){
        await pool.query(`TRUNCATE nd_toko_barang_assignment`);
      }
      
      // this row needed to get alias for rabbitMQ send company value
      const getToko = 'SELECT * FROM nd_toko WHERE id = ?';
      const [tokoRows] = await pool.query(getToko, [toko_id]);
      if (tokoRows.length === 0) {
        throw new Error('Toko not found');
      }else{
        tokoAlias = tokoRows[0].alias;
      }

      try {
        
        await pool.query('START TRANSACTION');
  
        const query = `INSERT INTO nd_toko_barang_assignment (toko_id, barang_id) VALUES  (?,?) `;
        const [insertQuery] = await pool.query(query, [toko_id, barang_id])
        if (insertQuery.affectedRows === 0) {
          throw new Error('Add toko barang failed');
        }
  
        const resId = insertQuery.insertId;
  
        if(tokoAlias === ""){
          throw new Error('Toko Alias not found');
        }
        await pool.query('COMMIT');
        
        queryLogger(pool, `nd_toko_barang_assignment`, resId, query, [toko_id, barang_id]);

        const dataRMQ = {
          company:tokoAlias, 
          toko_id: toko_id, 
          barang_id: barang_id,
          pool: pool
        }

        await assignBarangToko(dataRMQ);
      
        return {id:resId};
      } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        throw error;
      }
    },
  },
  BarangToko:{
    toko:handleResolverError(async (parent, args, context) =>{
      const { pool } = context;
      const query = 'SELECT * FROM nd_toko WHERE id = ?';
      const [rows] = await pool.query(query, [parent.toko_id]);
      return rows[0];
    }),
    barang:handleResolverError(async(parent, args, context)=>{
      const { pool } = context;
      const query = 'SELECT * FROM nd_barang WHERE id = ?';
      const [rows] = await pool.query(query, [parent.barang_id]);
      return rows[0];
    })
  }
}

export default barangTokoResolver;