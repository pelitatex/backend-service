import { queryLogger } from "../../helpers/queryTransaction.js";
// import { queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const satuanResolver = {
  Query:{
    satuan: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      const query = `SELECT * FROM nd_satuan WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
    }),
    allSatuan: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      const query = 'SELECT * FROM nd_satuan';
      const [rows] = await pool.query(query);
      return rows;
    })
  },
  Mutation: {
    addSatuan: handleResolverError(async (_, {input}, context) => {
      const pool = context.pool;
      const { nama, status_aktif } = input;

      let insertId = null
      try {
        const query = 'INSERT INTO nd_satuan (nama, status_aktif) VALUES (?, ?)';
        pool.query('START TRANSACTION');
        const [result] = await pool.query(query, [nama, status_aktif]);
        if(result.affectedRows === 0) {
          throw new Error('Failed to insert data into nd_satuan');
        }
        insertId = result.insertId;
        pool.query('COMMIT');
        await queryLogger(pool, 'nd_satuan', result.insertId ,query, [nama, status_aktif]);
        
      } catch (error) {
        pool.query('ROLLBACK');
        throw error;
      }

      return { id: insertId, nama, status_aktif };
    }),
    updateSatuan: handleResolverError(async (_, {id, input}, context) => {
      const pool = context.pool;
      const { nama, status_aktif } = input;
      const query = 'UPDATE nd_satuan SET nama = ?, status_aktif = ? WHERE id = ?';

      try {
        pool.query('START TRANSACTION');
        const [result] = await pool.query(query, [nama, status_aktif, id]);
        if (result.affectedRows === 0) {
          throw new Error(`Satuan with id ${id} not found.`);
        }
        pool.query('COMMIT');
        await queryLogger(pool, 'nd_satuan' ,query, [nama, status_aktif,id]);
        
      } catch (error) {
        pool.query('ROLLBACK');
        throw error;        
      }
      return { id : id, nama, status_aktif }; 
    })
  }
}

export default satuanResolver;