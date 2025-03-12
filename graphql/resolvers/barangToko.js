import { sendToQueue } from "../../helpers/producers.js";
import queryLogger from "../../helpers/queryTransaction.js";

const barangTokoResolver = {
  Query:{
    barangToko: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        try {
          if (!args.toko_id) {
            throw new Error('Toko ID is required');
          }
          context.useSatuanLoader = true;
          const query = `SELECT * FROM nd_toko_barang_assignment WHERE toko_id = ?`;
          const [rows] = await pool.query(query, [args.toko_id]);
          return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error barang per toko");
        }
    },
    allBarangToko: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        try {
          context.useSatuanLoader = false;
          const query = 'SELECT * FROM nd_toko_barang_assignment';
          const [rows] = await pool.query(query);
          return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Barang TOKO All");
        }
    }
  },
  Mutation:{
    addBarangToko: async (_, {input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      const {toko_id, barang_id} = input;
      let tokoAlias = "";

      const checkQuery = `SELECT barang_toko.* 
      FROM ( SELECT * FROM nd_toko_barang_assignment WHERE toko_id = ? and barang_id = ? ) barang_toko 
      LEFT JOIN nd_toko ON barang_toko.toko_id = nd_toko.id`;
      const [checkRows] = await pool.query(checkQuery, [toko_id, barang_id]);
      if (checkRows.length > 0) {
        throw new Error('Toko sudah punya barang sku.');
      }else{
        tokoAlias = checkRows[0].alias;
      }
      
      try {

        const query = `INSERT INTO nd_toko_barang_assignment (toko_id, barang_id) VALUES  (?,?) `;
        const [insertQuery] = await pool.query(query, [toko_id, barang_id])
        if (insertQuery[0].affectedRows === 0) {
          throw new Error('Add toko barang failed');
        }

        queryLogger(pool, `nd_toko_barang`, insertQuery[0].insertId, query, [toko_id, barang_id]);

        const notifDataQuery = `SELECT * FROM nd_barang_sku WHERE barang_id = ?`;
        const [notifDataRows] = await pool.query(notifDataQuery, [barang_id]);
        if(notifDataRows[0].count === 0){
          console.log('Barang tidak ada sku');
        }
        
        if(tokoAlias === ""){
          throw new Error('Toko Alias not found');
        }else{
          const msg = {company:tokoAlias, ...notifDataRows[0]};
          sendToQueue('pairing_barang_master_toko', Buffer.from(JSON.stringify(msg)), 60000 );
        }
        
        return true;
        
      } catch (error) { 
        console.error(error);
        throw new Error(error.message || 'Internal Server Error add toko barang sku');
      }
    },
  },
  BarangToko:{
    toko:async (parent, args, context) =>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
      try {
        const query = 'SELECT * FROM nd_toko WHERE id = ?';
        const [rows] = await pool.query(query, [parent.toko_id]);
        return rows[0];
      } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error get barangsku toko');
      }
    },
    barang:async(parent, args, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
      try {
        const query = 'SELECT * FROM nd_barang WHERE id = ?';
        const [rows] = await pool.query(query, [parent.barang_id]);
        return rows[0];
      } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error get barangsku all');
      }
    }
  }
}

export default barangTokoResolver;