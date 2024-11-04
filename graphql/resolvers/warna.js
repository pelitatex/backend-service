// import queryLogger from "../../helpers/queryTransaction.js";
import queryTransaction from "../../helpers/queryTransaction.js";

const warnaResolver = {
  Query : {
    warna: async(_,args, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
        try {
            const query = `SELECT * FROM nd_warna WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Warna Single");
        }
    },
    allWarna: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }

        try {
            const query = 'SELECT * FROM nd_warna';
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Warna All");
        }
    }
  },
  Mutation: {
    addWarna: async (_, {input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      try {
        let { warna_jual, warna_beli, kode_warna, status_aktif } = input;
        
        if (!warna_jual || warna_jual.trim() === '') {
          throw new Error('Nama cannot be null or blank');
        }

        if (!warna_beli || warna_beli.trim() === '') {
          warna_beli = warna_jual;
        }
        
        const checkQuery = 'SELECT COUNT(*) as count FROM nd_warna WHERE warna_jual = ?';
        const [checkResult] = await pool.query(checkQuery, [warna_jual]);
        if (checkResult[0].count > 0) {
          throw new Error('Nama already exists');
        }

        if (status_aktif == null) {
          status_aktif = true;
        }
        
        const query = 'INSERT INTO nd_warna (warna_jual, warna_beli, kode_warna, status_aktif) VALUES (?, ?, ?, ?)';
        const params = [warna_jual, warna_beli, kode_warna, status_aktif];
        const result = await queryTransaction.insert(context, 'nd_warna', query, params);
        return result;

        /* const [result] = await pool.query(query, [warna_jual, warna_beli, kode_warna, status_aktif]);
        queryLogger(pool, `nd_warna`, result.insertId, query, [warna_jual, warna_beli, kode_warna, status_aktif]);
        return { id: result.insertId, warna_jual, warna_beli, kode_warna, status_aktif }; */
      } catch (error) {
        console.error(error);
        throw new Error(error.message);
      }
    },
    
    updateWarna: async (_, {id, input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      try {
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

        const checkExistQuery = 'SELECT COUNT(*) as count FROM nd_warna WHERE warna_jual = ? AND id != ?';
        const [existResult] = await pool.query(checkExistQuery, [warna_jual, id]);
        if (existResult[0].count > 0) {
          throw new Error('Nama already exists');
        }

        const query = 'UPDATE nd_warna SET warna_jual = ?, warna_beli = ?, kode_warna = ?, status_aktif = ? WHERE id = ?';
        const params = [warna_jual, warna_beli, kode_warna, status_aktif, id];
        const result = await queryTransaction.update(context, 'nd_warna', id, query, params);
        return result;
        /* const [result] = await pool.query(query, [warna_jual, warna_beli, kode_warna, status_aktif, id]);
        if (result.affectedRows === 0) {
          throw new Error('Warna not found');
        }

        queryLogger(pool, `nd_warna`, id, query, [warna_jual, warna_beli, kode_warna, status_aktif, id]);

        return { id, warna_jual, warna_beli, kode_warna, status_aktif }; */

      } catch (error) {
        console.error(error);
        throw new Error(error.message);
      }
    }
  },
}

export default warnaResolver;