import { queryLogger } from "../../helpers/queryTransaction.js";
// import { queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const satuanResolver = {
  Query:{
    satuan: handleResolverError(async(_,args, context)=>{
      const query = `SELECT * FROM nd_satuan WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
    }),
    allSatuan: handleResolverError(async(_,args, context)=>{
      const query = 'SELECT * FROM nd_satuan';
      const [rows] = await pool.query(query);
      return rows;
    })
  },
  Mutation: {
    addSatuan: handleResolverError(async (_, {input}, context) => {
      const { nama, status_aktif } = input;
      const query = 'INSERT INTO nd_satuan (nama, status_aktif) VALUES (?, ?)';

      const [result] = await pool.query(query, [nama, status_aktif]);
      queryLogger(pool, 'nd_satuan', result.insertId ,query, [nama, status_aktif]);
      return { id: result.id, nama, status_aktif };
    }),
    updateSatuan: handleResolverError(async (_, {id, input}, context) => {
      const { nama, status_aktif } = input;
      const query = 'UPDATE nd_satuan SET nama = ?, status_aktif = ? WHERE id = ?';
      const [result] = await pool.query(query, [nama, status_aktif, id]);
      if (result.affectedRows === 0) {
        throw new Error(`Satuan with id ${id} not found.`);
      }
      queryLogger(pool, 'nd_satuan' ,query, [nama, status_aktif,id]);
      return { id : id, nama, status_aktif }; 
    })
  }
}

export default satuanResolver;