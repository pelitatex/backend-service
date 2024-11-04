// import queryLogger from "../../helpers/queryTransaction.js";
import queryTransaction from "../../helpers/queryTransaction";

const supplierResolver = {
  Query:{
    supplier: async(_,args, context)=>{
      // const pool = getPoolForRequest(req);
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }

        try {
            const query = `SELECT * FROM nd_supplier WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Supplier Single");
        }
    },
    allSupplier: async(_,args, context)=>{
      // const pool = getPoolForRequest(req);
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }

        try {
            const query = 'SELECT * FROM nd_supplier';
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Supplier All");
        }
    }
  },
  Mutation: {
    addSupplier: async (_, {input}, context) => {

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


      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      const checkQuery = 'SELECT COUNT(*) as count FROM nd_supplier WHERE nama = ? or kode = ?';
      const [checkResult] = await pool.query(checkQuery, [nama, kode]);
      if (checkResult[0].count > 0) {
        throw new Error('Supplier with the same name or code already exists');
      }
    

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
        const result = await queryTransaction.insert(context, 'nd_supplier', query, params);

        /* const [result] = await pool.query(query, [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif]);
        queryLogger(pool, `nd_supplier`, result.insertId, query, [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif]); */

        return { id: result.id, kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif };
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Add Supplier");
      }
    },
    updateSupplier: async (_, {id, input}, context) => {

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

      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      const checkQuery = 'SELECT COUNT(*) as count FROM nd_supplier WHERE (nama = ? OR kode = ?) AND id != ?';
      const [checkResult] = await pool.query(checkQuery, [nama, kode, id]);
      if (checkResult[0].count > 0) {
        throw new Error('Supplier with the same name or code already exists');
      }

      try {
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
        const [result] = await pool.query(query, [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif, id]);
        if (result.affectedRows === 0) {
          throw new Error("Supplier not found");
        }
        queryLogger(pool, `nd_supplier`, id, query, [kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif]);
        return { id, kode, nama, alamat, telepon, fax, kota, kode_pos, nama_bank, no_rek_bank, email, website, status_aktif };
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Update Supplier");
      }
    }
  }
}

export default supplierResolver;