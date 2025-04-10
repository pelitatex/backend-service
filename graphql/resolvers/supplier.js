import { queryLogger } from "../../helpers/queryTransaction.js";
//import { queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const supplierResolver = {
  Query:{
    supplier: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      const query = `SELECT * FROM nd_supplier WHERE id = ?`;
        const [rows] = await pool.query(query, [args.id]);
        return rows[0];
    }),
    allSupplier: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      const query = 'SELECT * FROM nd_supplier';
      const [rows] = await pool.query(query);
      return rows;
    })
  },
  Mutation: {
    addSupplier: handleResolverError(async (_, {input}, context) => {
      const pool = context.pool;

      const {
        kode,
        nama,
        alamat,
        telepon,
        fax,
        kota,
        kode_pos,
        nama_bank,
        no_rek_bank,
        email,
        website,
        status_aktif
      } = input;

      try {
        const query = `INSERT INTO nd_supplier (
          kode,
          nama,
          alamat,
          telepon,
          
          fax,
          kota,
          kode_pos,
          nama_bank,
          
          no_rek_bank,
          email,
          website,
          status_aktif
        ) VALUES (?,?,?,?, ?,?,?,?, ?,?,?,?)`;

        const params = [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif];
        let insertId = null;
        try {
          pool.query('START TRANSACTION');
          const [result] = await pool.query(query, params);
          if(result.affectedRows === 0) {
            throw new Error('Failed to insert data into nd_supplier');
          }
          insertId = result.insertId;
          pool.query ('COMMIT');
        } catch (error) {
          pool.query('ROLLBACK');
          throw error;
        }
        queryLogger(pool, `nd_supplier`, insertId, query, [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif]);

        return { id: insertId, kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif };
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Add Supplier");
      }
    }),
    updateSupplier: handleResolverError(async (_, {id, input}, context) => {
      const pool = context.pool;

      const {
        kode,
        nama,
        alamat,
        telepon,
        fax,
        kota,
        kode_pos,
        nama_bank,
        no_rek_bank,
        email,
        website,
        status_aktif
      } = input;

      const query = `UPDATE nd_supplier SET 
          kode = ?,
          nama = ?,
          alamat = ?,
          telepon = ?,
          fax = ?,
          kota = ?,
          kode_pos = ?,
          nama_bank = ?,
          no_rek_bank = ?,
          email = ?,
          website = ?,
          status_aktif = ?
          WHERE id = ?`;

        const params = [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif, id];
        try {
          
          pool.query('START TRANSACTION');
          const [result] = await pool.query(query, [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif, id]);
          if (result.affectedRows === 0) {
            throw new Error("Supplier not found");
          }
          pool.query('COMMIT');

        }catch (error) {
          pool.query('ROLLBACK');
          throw error;
        }
        queryLogger(pool, `nd_supplier`, id, query, [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif]);
        return { id, kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif };

    })
  }
}

export default supplierResolver;