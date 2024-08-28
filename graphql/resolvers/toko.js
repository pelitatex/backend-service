import queryLogger from "../../helpers/queryLogger.js";

const tokoResolver = {
  Query : {
    toko: async(_,args, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
        try {
            const query = `SELECT * FROM nd_toko WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Toko Single");
        }
    },
    allToko: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }

        try {
            const query = 'SELECT * FROM nd_toko';
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Toko All");
        }
    }
  },
  Mutation: {
    addToko: async (_, {input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      try {
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
        
        const checkQueryNama = 'SELECT COUNT(*) as count FROM nd_toko WHERE nama = ?';
        const [checkResultNama] = await pool.query(checkQueryNama, [nama]);
        if (checkResultNama[0].count > 0) {
          throw new Error('Nama already exists');
        }

        const checkQueryKode = 'SELECT COUNT(*) as count FROM nd_toko WHERE kode_toko = ?';
        const [checkResultKode] = await pool.query(checkQueryKode, [kode_toko]);
        if (checkResultKode[0].count > 0) {
          throw new Error('Kode Toko already exists');
        }

        const query = `INSERT INTO nd_toko (
          nama, alamat, telepon, email, 
          kota, kode_pos,npwp,
          kode_toko, status_aktif, nama_domain, email_pajak) 
          VALUES (?,?,?,?,
          ?,?,?,
          ?,?,?,?)`;
        const [result] = await pool.query(query, [
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
          email_pajak]);
        
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
      } catch (error) {
        console.error(error);
        throw new Error(error.message);
      }
    },
    
    updateToko: async (_, {id, input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      try {
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

        const checkQueryNama = 'SELECT COUNT(*) as count FROM nd_toko WHERE nama = ? AND id != ?';
        const [checkResultNama] = await pool.query(checkQueryNama, [nama, id]);
        if (checkResultNama[0].count > 0) {
          throw new Error('Nama already exists');
        }

        const checkQueryKode = 'SELECT COUNT(*) as count FROM nd_toko WHERE kode_toko = ? AND id != ?';
        const [checkResultKode] = await pool.query(checkQueryKode, [kode_toko, id]);
        if (checkResultKode[0].count > 0) {
          throw new Error('Kode Toko already exists');
        }

        const query = `UPDATE nd_toko SET 
          nama = ?, alamat = ?, telepon = ?, email = ?, 
          kota = ?, kode_pos = ?, npwp = ?, 
          kode_toko = ?, status_aktif = ?, nama_domain = ?, email_pajak = ? 
          WHERE id = ?`;
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

      } catch (error) {
        console.error(error);
        throw new Error(error.message);
      }
    }
  },
}

export default tokoResolver;