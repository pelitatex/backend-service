import { queryLogger } from "../../helpers/queryTransaction.js";
//import { queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const warnaResolver = {
  Query : {
    warna: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      const query = `SELECT * FROM nd_warna WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
    }),
    allWarna: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      const query = 'SELECT * FROM nd_warna';
      const [rows] = await pool.query(query);
      return rows;
    })
  },
  Mutation: {
    addWarna: handleResolverError(async (_, {input}, context) => {
      const pool = context.pool;
      let { warna_jual, warna_beli, kode_warna, status_aktif } = input;
        
      if (!warna_jual || warna_jual.trim() === '') {
        throw new Error('Nama cannot be null or blank');
      }

      if (!warna_beli || warna_beli.trim() === '') {
        warna_beli = warna_jual;
      }

      if (status_aktif == null) {
        status_aktif = true;
      }
      
      const query = 'INSERT INTO nd_warna (warna_jual, warna_beli, kode_warna, status_aktif) VALUES (?, ?, ?, ?)';
      const params = [warna_jual, warna_beli, kode_warna, status_aktif];
    
      const [result] = await pool.query(query, [warna_jual, warna_beli, kode_warna, status_aktif]);
      queryLogger(pool, `nd_warna`, result.insertId, query, params);
      return { id: result.insertId, warna_jual, warna_beli, kode_warna, status_aktif };
    }),
    
    updateWarna: handleResolverError(async (_, {id, input}, context) => {
      const pool = context.pool;
      let { warna_jual, warna_beli, kode_warna, status_aktif } = input;

      if (!warna_jual || warna_jual.trim() === '') {
        throw new Error('Nama cannot be null or blank');
      }

      // for future use please check if warna_beli is null or blank
      // now will not show in the frontend
      warna_beli = warna_jual;

      if (status_aktif == null) {
        status_aktif = true;
      }

      const query = 'UPDATE nd_warna SET warna_jual = ?, warna_beli = ?, kode_warna = ?, status_aktif = ? WHERE id = ?';
      const params = [warna_jual, warna_beli, kode_warna, status_aktif, id];
      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        throw new Error('Warna not found');
      }

      queryLogger(pool, `nd_warna`, id, query, [warna_jual, warna_beli, kode_warna, status_aktif, id]);

      return { id, warna_jual, warna_beli, kode_warna, status_aktif };

    })
  },
  Warna:{
    barangSKU:handleResolverError(async(parent, args, context)=>{
      const pool = context.pool;
      const query = 'SELECT * FROM nd_barang_sku WHERE warna_id = ?';
      const [rows] = await pool.query(query, [parent.id]);
      return rows;
    })
  }
}

export default warnaResolver;