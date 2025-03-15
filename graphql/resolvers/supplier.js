import queryLogger from "../../helpers/queryTransaction.js";
//import { queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const supplierResolver = {
  Query:{
    supplier: handleResolverError(async(_,args, context)=>{
      const query = `SELECT * FROM nd_supplier WHERE id = ?`;
        const [rows] = await pool.query(query, [args.id]);
        return rows[0];
    }),
    allSupplier: handleResolverError(async(_,args, context)=>{
      const query = 'SELECT * FROM nd_supplier';
      const [rows] = await pool.query(query);
      return rows;
    })
  },
  Mutation: {
    addSupplier: handleResolverError(async (_, {input}, context) => {

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
        const [result] = await pool.query(query, [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif]);
        queryLogger(pool, `nd_supplier`, result.insertId, query, [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif]);

        return { id: result.id, kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif };
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Add Supplier");
      }
    }),
    updateSupplier: handleResolverError(async (_, {id, input}, context) => {

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
        const [result] = await pool.query(query, [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif, id]);
        if (result.affectedRows === 0) {
          throw new Error("Supplier not found");
        }
        queryLogger(pool, `nd_supplier`, id, query, [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif]);
        return { id, kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif };

    })
  }
}

export default supplierResolver;