// import queryLogger from "../../helpers/queryTransaction.js";
import { queryLogger, queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const gudangResolver = {
  Query : {
    gudang: handleResolverError(async(_,args, context)=>{
      
      const query = `SELECT * FROM nd_gudang WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
    }),
    allGudang: handleResolverError(async(_,args, context)=>{
      const query = 'SELECT * FROM nd_gudang';
      const [rows] = await pool.query(query);
      return rows;  
    })
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
        const params = [nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif];

        const result = await queryTransaction.insert(context, 'nd_gudang', query, params);
        
        /* const [result] = await pool.query(query, [nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif]);
        const insertedId = result.insertId;
        queryLogger(pool, `nd_gudang`, result.insertId, query, [
          nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif] ); */

        return {id: result.id, nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif};
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
        const params = [nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif, id];
        const result = await queryTransaction.update(context, 'nd_gudang', id, query, params);
        return result;

        /* const [result] = await pool.query(query, [nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif, id]);
        if (result.affectedRows === 0) {
          throw new Error('Gudang not found');
        }
        queryLogger(pool, `nd_gudang`, id, query, [
          nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif, id] ); 
        return {id, nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif};*/
      } catch (error) {
        console.error(error);
        throw new Error(error.message || 'Internal Server Error Update Gudang');
      }
    },
  },
  
}

export default gudangResolver;