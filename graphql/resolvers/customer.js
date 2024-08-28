const customerResolver = {
  Query:{
    customer: async(_,args, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
        try {
            const query = `SELECT * FROM nd_customer WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Customer All");
        }
    },
    allCustomer: async(_,args,context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
      try {
          const query = 'SELECT * FROM nd_customer';
          const [rows] = await pool.query(query);
          return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Customer All");
        }
    }
  },
  Mutation: {
    addCustomer: async (_, input, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
      try {
        const { 
          tipe_company, nama,
          alamat, blok, no, rt, rw,
          kecamatan, kelurahan, kota, provinsi, kode_pos,
          npwp, nik, 
          tempo_kredit, warning_kredit,
          limit_warning_type, limit_warning_amount,
          limit_amount, limit_atas,
          img_link, npwp_link, ktp_link,
          contact_person, telepon, email, medsos_link,
          jenis_perkerjaan, jenis_produk, 
          status_aktif 

        } = input;
        
        const query = 'INSERT INTO nd_customer (name, email, phone) VALUES (?, ?, ?)';
        const [result] = await pool.query(query, [tipe_company, nama, alamat, blok, no, rt, rw, 
          kecamatan, kelurahan, kota, provinsi, kode_pos, 
          npwp, nik, tempo_kredit, 
          warning_kredit, limit_warning_type, limit_warning_amount, 
          limit_amount, limit_atas, 
          img_link, npwp_link, ktp_link, 
          contact_person, telepon, email, medsos_link, 
          jenis_perkerjaan, jenis_produk, 
          status_aktif]);

        queryLogger(pool, `nd_customer`, result.insertId, query, [tipe_company, nama, alamat, blok, no, rt, rw, 
          kecamatan, kelurahan, kota, provinsi, kode_pos, 
          npwp, nik, tempo_kredit, 
          warning_kredit, limit_warning_type, limit_warning_amount, 
          limit_amount, limit_atas, 
          img_link, npwp_link, ktp_link, 
          contact_person, telepon, email, medsos_link, 
          jenis_perkerjaan, jenis_produk, 
          status_aktif]);

        return { id: result.insertId, tipe_company, nama, alamat, blok, no, rt, rw,
          kecamatan, kelurahan, kota, provinsi, kode_pos,
          npwp, nik, tempo_kredit, warning_kredit,
          limit_warning_type, limit_warning_amount, limit_amount, limit_atas,
          img_link, npwp_link, ktp_link,
          contact_person, telepon, email, medsos_link,
          jenis_perkerjaan, jenis_produk,
          status_aktif
        };
      } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error Add Customer');
      }
    },
    updateCustomer: async (_, {id, input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
      try {
        const { 
          tipe_company, nama,
          alamat, blok, no, rt, rw,
          kecamatan, kelurahan, kota, provinsi, kode_pos,
          npwp, nik, 
          tempo_kredit, warning_kredit,
          limit_warning_type, limit_warning_amount,
          limit_amount, limit_atas,
          img_link, npwp_link, ktp_link,
          contact_person, telepon, email, medsos_link,
          jenis_perkerjaan, jenis_produk, 
          status_aktif 

        } = input;
        const query = `UPDATE nd_customer SET 
        tipe_company = ?, nama = ?, alamat = ?, blok = ?, no = ?, rt = ?, rw = ?,
        kecamatan = ?, kelurahan = ?, kota = ?, provinsi = ?, kode_pos = ?,
        npwp = ?, nik = ?,
        tempo_kredit = ?, warning_kredit = ?,
        limit_warning_type = ?, limit_warning_amount = ?,
        limit_amount = ?, limit_atas = ?,
        img_link = ?, npwp_link = ?, ktp_link = ?,
        contact_person = ?, telepon = ?, email = ?, medsos_link = ?,
        jenis_perkerjaan = ?, jenis_produk = ?,
        status_aktif = ?
        WHERE id = ?`;
        const [result] = await pool.query(query, [tipe_company, nama, alamat, blok, no, rt, rw,
          kecamatan, kelurahan, kota, provinsi, kode_pos,
          npwp, nik, tempo_kredit, warning_kredit,
          limit_warning_type, limit_warning_amount, limit_amount, limit_atas,
          img_link, npwp_link, ktp_link,
          contact_person, telepon, email, medsos_link,
          jenis_perkerjaan, jenis_produk,
          status_aktif, id]);
        
        if (result.affectedRows === 0) {
          throw new Error("Customer not found");
        }

        queryLogger(pool, `nd_customer`, result.insertId, query, [tipe_company, nama, alamat, blok, no, rt, rw,
          kecamatan, kelurahan, kota, provinsi, kode_pos,
          npwp, nik, tempo_kredit, warning_kredit,
          limit_warning_type, limit_warning_amount, limit_amount, limit_atas,
          img_link, npwp_link, ktp_link,
          contact_person, telepon, email, medsos_link,
          jenis_perkerjaan, jenis_produk,
          status_aktif, id]);

        return { id, tipe_company, nama, alamat, blok, no, rt, rw,
          kecamatan, kelurahan, kota, provinsi, kode_pos,
          npwp, nik, tempo_kredit, warning_kredit,
          limit_warning_type, limit_warning_amount, limit_amount, limit_atas,
          img_link, npwp_link, ktp_link,
          contact_person, telepon, email, medsos_link,
          jenis_perkerjaan, jenis_produk,
          status_aktif
        };
      } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error Update Customer');
      }
    }
  }
}

export default customerResolver;