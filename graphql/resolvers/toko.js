import queryLogger from "../../helpers/queryTransaction.js";
//import { queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const tokoResolver = {
  Query : {
    toko: handleResolverError (async(_,args, context)=>{
      const query = `SELECT * FROM nd_toko WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
    }),
    allToko: handleResolverError (async(_,args, context)=>{
      const query = 'SELECT * FROM nd_toko';
      const [rows] = await pool.query(query);
      return rows;
    })
  },
  Mutation: {
    addToko: handleResolverError (async (_, {input}, context) => {
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

      const [result] = await pool.query(query, params);
      
      queryLogger(pool, `nd_toko`, result.insertId, query, [
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
        email_pajak] );

      
      return { id: result.insertId, nama,
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
        
      const [result] = await pool.query(query, [
        nama, alamat, telepon, email,
        kota, kode_pos, npwp, 
        kode_toko, status_aktif, nama_domain, email_pajak, 
        id]);

      if (result.affectedRows === 0) {
        throw new Error('Toko not found');
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