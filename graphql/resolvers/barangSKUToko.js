import {v4 as uuidv4} from 'uuid';
// import queryLogger from "../../helpers/queryTransaction.js";
import queryTransaction from '../../helpers/queryTransaction.js';
import barangSKUResolver from './barangSKU.js';

const barangSKUResolver = {
  Query:{
    barangSKUToko: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        try {
          context.useSatuanLoader = true;
          const query = `SELECT * FROM nd_toko_barang_sku WHERE toko_id = ?`;
          const [rows] = await pool.query(query, [args.toko_id]);
          return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error");
        }
    },
    allBarangSKUToko: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        try {
          context.useSatuanLoader = false;
          const query = 'SELECT * FROM nd_toko_barang_sku';
          const [rows] = await pool.query(query);
          return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Barang SKU TOKO All");
        }
    }
  },
  Mutation:{
    addBarangSKUToko: async (_, {input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      const {toko_id, barang_sku_id} = input;

      const checkQuery = 'SELECT * FROM nd_toko_barang_sku WHERE toko_id = ? and barang_sku_id = ?';
      const [checkRows] = await pool.query(checkQuery, [toko_id, barang_sku_id]);
      if (checkRows.length > 0) {
        throw new Error('Toko sudah punya barang sku.');
      }
      
      try {

        const query = `INSERT INTO nd_toko_barang_sku (toko_id, barang_sku_id) VALUES  (?,?) `;
        const [insertQuery] = await pool.query(query, [toko_id, barang_sku_id])
        if (insertQuery[0].count > 0) {
          throw new Error('Add toko barang sku failed');
        }
        return true;

      } catch (error) { 
        console.error(error);
        throw new Error(error.message || 'Internal Server Error Add toko barang sku');
      }
    },
    updateBarangSKUToko: async (_, {id, input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
      try {
        throw new Error('Internal Server Toko SKU Barang tidak bisa di edit');

      } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error Update Barang');
      }
    },
  },
}

export default barangSKUResolver;