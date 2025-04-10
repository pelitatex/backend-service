import { queryLogger } from "../../helpers/queryTransaction.js";
//import { queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const tokoResolver = {
  Query : {
    toko: handleResolverError (async(_,args, context)=>{
      const pool = context.pool;
      const query = `SELECT * FROM nd_toko WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
    }),
    allToko: handleResolverError (async(_,args, context)=>{
      const pool = context.pool;
      const query = 'SELECT * FROM nd_toko';
      const [rows] = await pool.query(query);
      return rows;
    })
  },
  Mutation: {
    addToko: handleResolverError (async (_, {input}, context) => {
      const pool = context.pool;
      let {
        nama,
        alamat,
        telepon,
        email,
        kota,
        kode_pos,
        npwp,
        kode_toko,
        status_aktif,
        nama_domain,
        email_pajak } = input;

        let insertId = null
        try {
          const query = `INSERT INTO nd_toko (
            nama, alamat, telepon, email, 
            kota, kode_pos,npwp,
            kode_toko, status_aktif, nama_domain, email_pajak) 
            VALUES (?,?,?,?,
            ?,?,?,
            ?,?,?,?)`;
    
          const params = [
            nama,
            alamat,
            telepon,
            email,
            kota,
            kode_pos,
            npwp,
            kode_toko,
            status_aktif,
            nama_domain,
            email_pajak];
    
          pool.query('START TRANSACTION');
          const [result] = await pool.query(query, params);
          if(result.affectedRows === 0) {
            throw new Error('Failed to insert data into nd_toko');
          }
          insertId = result.insertId;
          pool.query('COMMIT');
          
        } catch (error) {
          pool.query('ROLLBACK');
          throw error;
          
        }
      
      
      queryLogger(pool, `nd_toko`, result.insertId, query, params );

      
      return { id: insertId, nama,
        alamat,
        telepon,
        email,
        kota,
        kode_pos,
        npwp,
        kode_toko,
        status_aktif,
        nama_domain,
        email_pajak };
    }),
    
    updateToko: handleResolverError(async (_, {id, input}, context) => {
      const pool = context.pool;
      let { nama,
        alamat,
        telepon,
        email,
        kota,
        kode_pos,
        npwp,
        kode_toko,
        status_aktif,
        nama_domain,
        email_pajak } = input;
        
      if (status_aktif == null) {
        status_aktif = true;
      }

      const query = `UPDATE nd_toko SET 
        nama = ?, alamat = ?, telepon = ?, email = ?, 
        kota = ?, kode_pos = ?, npwp = ?, 
        kode_toko = ?, status_aktif = ?, nama_domain = ?, email_pajak = ? 
        WHERE id = ?`;

      const params = [
        nama, alamat, telepon, email,
        kota, kode_pos, npwp, 
        kode_toko, status_aktif, nama_domain, email_pajak, 
        id];
        
      try {

        pool.query('START TRANSACTION');
        const [result] = await pool.query(query, params);
        if (result.affectedRows === 0) {
          throw new Error('Toko not found');
        }
        insertId = result.insertId;
        pool.query('COMMIT');
        
      } catch (error) {
        pool.query('ROLLBACK');
        throw error;
      }

      queryLogger(pool, `nd_toko`, id, query, [
        nama, alamat, telepon, email,
        kota, kode_pos, npwp, 
        kode_toko, status_aktif, nama_domain, email_pajak, 
        id] );
      return { id, nama, alamat, telepon, email, kota, kode_pos, npwp, kode_toko, status_aktif, nama_domain, email_pajak };
    })
  },
}

export default tokoResolver;