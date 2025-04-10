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
      let insertId = null;
      try {
        pool.query('START TRANSACTION');
        const [result] = await pool.query(query, [warna_jual, warna_beli, kode_warna, status_aktif]);
        if(result.affectedRows === 0) {
          throw new Error('Failed to insert data into nd_warna');
        }
        insertId = result.insertId;
        pool.query('COMMIT');
      } catch (error) {
        pool.query('ROLLBACK');
        throw error;
      }      
    
      queryLogger(pool, `nd_warna`, insertId, query, params);
      return { id: insertId, warna_jual, warna_beli, kode_warna, status_aktif };
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
      try {
        pool.query('START TRANSACTION');
        const [result] = await pool.query(query, params);
        if (result.affectedRows === 0) {
          throw new Error('Warna not found');
        }
        pool.query('COMMIT');        
      } catch (error) {
        pool.query('ROLLBACK');
        throw error;
        
      }

      queryLogger(pool, `nd_warna`, id, query, params);

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