import { sendToQueue } from "../../helpers/producers.js";
import { queryLogger } from "../../helpers/queryTransaction.js";
import { ENVIRONMENT } from "../../config/loadEnv.js";
import { registerBarangSKUToko } from "../../helpers/registerBarangToko.js";
import handleResolverError from "../handleResolverError.js";

const barangTokoResolver = {
  Query:{
    barangToko: handleResolverError(async(_,args, context)=>{
        
      if (!args.toko_id) {
        throw new Error('Toko ID is required');
      }
      // context.useSatuanLoader = true;
      const query = `SELECT * FROM nd_toko_barang_assignment WHERE toko_id = ?`;
      const [rows] = await pool.query(query, [args.toko_id]);
      return rows[0];
      
    }),
    allBarangToko: handleResolverError(async(_,args, context)=>{
      // context.useSatuanLoader = false;
      const query = 'SELECT * FROM nd_toko_barang_assignment';
      const [rows] = await pool.query(query);
      return rows;
    })
  },
  Mutation:{
    addBarangToko: handleResolverError(async (_, {input}, context) => {
      
      const {toko_id, barang_id} = input;
      let tokoAlias = "";

      if(ENVIRONMENT === 'development'){
        pool.query(`TRUNCATE nd_toko_barang_assignment`);
      }
      
      const getToko = 'SELECT * FROM nd_toko WHERE id = ?';
      const [tokoRows] = await pool.query(getToko, [toko_id]);
      if (tokoRows.length === 0) {
        throw new Error('Toko not found');
      }else{
        tokoAlias = tokoRows[0].alias;
      }

      const checkQuery = `SELECT barang_toko.* 
      FROM ( 
        SELECT * 
        FROM nd_toko_barang_assignment 
        WHERE toko_id = ? and barang_id = ? 
      ) barang_toko 
      LEFT JOIN nd_toko ON barang_toko.toko_id = nd_toko.id`;
      const [checkRows] = await pool.query(checkQuery, [toko_id, barang_id]);
      if (checkRows.length > 0) {
        throw new Error('Toko sudah punya barang sku.');
      }

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

      /* const notifDataQuery = `SELECT * FROM nd_barang_sku WHERE barang_id = ?`;
      const [notifDataRows] = await pool.query(notifDataQuery, [barang_id]);
      if(notifDataRows.count === 0){
        console.log('Barang tidak ada sku');
      }
      const msg = {company:tokoAlias, ...notifDataRows[0]}; */

      initBarangMasterToko(tokoAlias, toko_id, barang_id, pool);
      
      return {id:resId};
    }),
  },
  BarangToko:{
    toko:handleResolverError(async (parent, args, context) =>{
      const query = 'SELECT * FROM nd_toko WHERE id = ?';
      const [rows] = await pool.query(query, [parent.toko_id]);
      return rows[0];
    }),
    barang:handleResolverError(async(parent, args, context)=>{
      const query = 'SELECT * FROM nd_barang WHERE id = ?';
      const [rows] = await pool.query(query, [parent.barang_id]);
      return rows[0];
    })
  }
}

export default barangTokoResolver;