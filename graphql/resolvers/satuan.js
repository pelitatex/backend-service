// import queryLogger from "../../helpers/queryTransaction.js";
import queryTransaction from "../../helpers/queryTransaction";

const satuanResolver = {
  Query:{
    satuan: async(_,args, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
        try {
            const query = `SELECT * FROM nd_satuan WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error(error.message || "Internal Server Error Satuan Single");
        }
    },
    allSatuan: async(_,args, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
      try {
        const query = 'SELECT * FROM nd_satuan';
        const [rows] = await pool.query(query);
        return rows;
      } catch (error) {
        console.error(error);
        throw new Error(error.message || "Internal Server Error Satuan All");
      }
    }
  },
  Mutation: {
    addSatuan: async (_, {input}, context) => {
      try {
        const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        const { nama, status_aktif } = input;
        const query = 'INSERT INTO nd_satuan (nama, status_aktif) VALUES (?, ?)';

        const result = await queryTransaction.insert(context, 'nd_satuan', query, [nama, status_aktif]);
        /* const [result] = await pool.query(query, [nama, status_aktif]);
        queryLogger(pool, 'nd_satuan', result.insertId ,query, [nama, status_aktif]); */
        return { id: result.id, nama, status_aktif };
      } catch (error) {
        console.error(error);
        throw new Error(error.message || "Internal Server Error Add Satuan");
      }
    },
    updateSatuan: async (_, {id, input}, context) => {
      try {
        const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        const { nama, status_aktif } = input;
        const query = 'UPDATE nd_satuan SET nama = ?, status_aktif = ? WHERE id = ?';
        const [result] = await pool.query(query, [nama, status_aktif, id]);
        if (result.affectedRows === 0) {
          throw new Error(`Satuan with id ${id} not found.`);
        }
        queryLogger(pool, 'nd_satuan' ,query, [nama, status_aktif,id]);
        return { id : id, nama, status_aktif };
      } catch (error) {
        console.error(error);
        throw new Error(error.message || "Internal Server Error Update Satuan");
      }
    }
  }
}

export default satuanResolver;