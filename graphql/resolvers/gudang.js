// import queryLogger from "../../helpers/queryTransaction.js";
import { queryLogger, queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const gudangResolver = {
  Query : {
    gudang: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      
      const query = `SELECT * FROM nd_gudang WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
    }),
    allGudang: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      const query = 'SELECT * FROM nd_gudang';
      const [rows] = await pool.query(query);
      return rows;  
    })
  },
  Mutation: {
    addGudang: handleResolverError(async (_, {input}, context) => {
      
      const pool = context.pool;
      const {nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif} = input;

      
      const query = 'INSERT INTO nd_gudang (nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif ) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const params = [nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif];
      
      let insertId = null;
      try {
        pool.query("START TRANSACTION;");
        const [result] = await pool.query(query, params);
        if(result.affectedRows === 0) {
          throw new Error('Failed to insert gudang');
        }
        pool.query("COMMIT;");
        insertId = result.insertId;
        await queryLogger(pool, `nd_gudang`, insertId, query, [
          nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif] );
        
      } catch (error) {
        pool.query("ROLLBACK;");
        throw error;
      }

      return {id: insertId, nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif};
    }),
    updateGudang: handleResolverError(async (_, {id, input}, context) => {
      const {nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif} = input;
      const query = `UPDATE nd_gudang SET nama = ?, lokasi = ?, status_default = ?,
      urutan = ?, visible = ?, gudang_group_id = ?, status_aktif = ?
      WHERE id = ?`;
      const params = [nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif, id];
      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        throw new Error('Gudang not found');
      }
      await queryLogger(pool, `nd_gudang`, id, query, params); 
      return {id, nama, lokasi, status_default, urutan, visible, gudang_group_id, status_aktif};
    }),
  },
  
}

export default gudangResolver;