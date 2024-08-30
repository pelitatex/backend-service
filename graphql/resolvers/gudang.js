import queryLogger from "../../helpers/queryLogger.js";

const gudangResolver = {
  Query : {
    gudang: async(_,args, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
        try {
            const query = `SELECT * FROM nd_gudang WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Gudang Single");
        }
    },
    allGudang: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }

        try {
            const query = 'SELECT * FROM nd_gudang';
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Gudang All");
        }
    }
  },
  Mutation: {
    addGudang: async (_, {input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      const {nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif} = input;

      const checkQuery = 'SELECT * FROM nd_gudang WHERE nama = ?';
      const [checkRows] = await pool.query(checkQuery, [nama]);
      if (checkRows.length > 0) {
        throw new Error('Gudang with the same name already exists.');
      }

      try {
        const query = 'INSERT INTO nd_gudang (nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif ) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, [nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif]);
        const insertedId = result.insertId;
        return {id: insertedId, nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif};
      } catch (error) {
        console.error(error);
        throw new Error( error.message || 'Internal Server Error Add Gudang');
      }
    },
    updateGudang: async (_, {id, input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      const {nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif} = input;
      const checkExistQuery = 'SELECT * FROM nd_gudang WHERE nama = ? AND id != ?';
      const [existRows] = await pool.query(checkExistQuery, [nama, id]);
      if (existRows.length > 0) {
        throw new Error('Gudang with the same name already exists.');
      }

      try {
        const query = `UPDATE nd_gudang SET nama = ?, lokasi = ?, status_default = ?,
        urutan = ?, visible = ?, gudang_group_id = ?, status_aktif = ?
        WHERE id = ?`;
        const [result] = await pool.query(query, [nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif, id]);
        if (result.affectedRows === 0) {
          throw new Error('Gudang not found');
        }
        return {id, nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif};
      } catch (error) {
        console.error(error);
        throw new Error(error.message || 'Internal Server Error Update Gudang');
      }
    },
  },
}

export default gudangResolver;