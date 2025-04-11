// import queryLogger from "../../helpers/queryTransaction.js";
import { queryLogger, queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const documentControlResolver = {
  Query:{
    documentControl: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      const query = `SELECT * FROM nd_document_control WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
    }),
    allDocumentControl: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      const query = 'SELECT * FROM nd_document_control';
      const [rows] = await pool.query(query);
      return rows;
    }),
    department: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      const query = `SELECT * FROM nd_department WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
    }),
    allDepartment: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      const query = 'SELECT * FROM nd_department';
      const [rows] = await pool.query(query);
      return rows;
    }),
  },
  Mutation: {
    addDocumentControl: handleResolverError(async (_, {input}, context) => {
      const pool = context.pool;
      const { department_id, tipe_dokumen, nama, kode, keterangan, status_aktif } = input;
      /* if (kode.length > 4 || kode.length == 0) {
        throw new Error('Kode must be 4 characters');
      } */

      let paddedKode = '01';
      let newKode = 1;

      let insertId = 0;
      let queryInsert = '';
      let paramInsert = [];
      
      try {

        pool.query('START TRANSACTION');
        pool.query('LOCK TABLES nd_document_control WRITE, nd_department WRITE');

        const queryLastCode = `SELECT no_kode, kode FROM nd_document_control WHERE department_id = ? AND status_aktif = 1 ORDER BY no_kode DESC LIMIT 1`;
        const [lastCodeRows] = await pool.query(queryLastCode, [department_id]);
  
        const queryGetDepartment = `SELECT * FROM nd_department WHERE id = ?`;
        const [departmentRows] = await pool.query(queryGetDepartment, [department_id]);
  
        const deptCode = departmentRows[0].kode;
  
        if (lastCodeRows.length > 0) {
          newKode = parseFloat(lastCodeRows[0].no_kode) + 1;
          paddedKode = newKode.toString().padStart(2, '0');
        }
  
        const newPaddedCode = `${deptCode}${paddedKode}`;
  
        queryInsert = `INSERT INTO nd_document_control (department_id, tipe_dokumen, nama, no_kode, kode, keterangan, status_aktif) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        paramInsert = [department_id, tipe_dokumen, nama.toUpperCase(), newKode, newPaddedCode, keterangan, status_aktif];
        
        const [result] = await pool.query(query, params);
        if(result.affectedRows === 0) {
          throw new Error("Document Control not found");
        }
        insertId = result.insertId;
        pool.query('UNLOCK TABLES');
        pool.query('COMMIT');
        
      } catch (error) {
        pool.query('ROLLBACK');
        throw error;
        
      }

      queryLogger(pool, `nd_document_control`, insertId, query, params);

      return { id: insertId, department_id, tipe_dokumen, nama : nama.toUpperCase(), kode : newPaddedCode, keterangan, status_aktif };
    }),
    updateDocumentControl: handleResolverError(async (_, {id, input}, context) => {
      const pool = context.pool;
      const { nama, keterangan, status_aktif } = input;
      /* if (kode.length > 4 || kode.length == 0) {
        throw new Error('Kode must be 4 characters');
      }
      const paddedKode = kode.padStart(4, '0'); */

      const query = `UPDATE nd_document_control SET 
        nama = ?,
        keterangan = ?,
        status_aktif = ?
      WHERE id = ?`;
      const params = [nama.toUpperCase(), keterangan, status_aktif, id];
      try {

        pool.query('START TRANSACTION');
        const [result] = await pool.query(query, params);
        if (result.affectedRows === 0) {
          throw new Error("Document Control not found");
        }
        pool.query('COMMIT');
        
      } catch (error) {
        pool.query('ROLLBACK');
        throw error;        
      }
      queryLogger(pool, `nd_document_control`, result.insertId, query, params);

      return { id: id, department_id, nama : nama.toUpperCase(), kode : paddedKode, keterangan, status_aktif }; 
    }),
    addDepartment: handleResolverError(async (_, {input}, context) => {
      const pool = context.pool;
      
      const { nama, kode, status_aktif } = input;
      if (kode.length > 2 || kode.length == 0) {
        throw new Error('Kode must be 2 characters');
      } 
      const paddedKode = kode.padStart(2, '0');

      const query = `INSERT INTO nd_department (nama, kode, status_aktif) VALUES (?, ?, ?)`;
      const params = [nama.toUpperCase(), paddedKode, status_aktif];
      const [result] = await pool.query(query, params);
      queryLogger(pool, `nd_department`, result.insertId, query, params);

      return { id: result.insertId, nama: nama.toUpperCase(), kode : paddedKode, status_aktif }; 
    }),
    updateDepartment: handleResolverError(async (_, {id, input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }
      const { nama, kode, status_aktif } = input;
      if (kode.length > 2 || kode.length == 0) {
        throw new Error('Kode must be 2 characters');
      }
      const paddedKode = kode.padStart(2, '0');

      const query = `UPDATE nd_department SET nama = ?, kode = ?, status_aktif = ? WHERE id = ?`;
      const params = [nama.toUpperCase(), paddedKode, status_aktif, id];
      const [result] = await pool.query(query, [nama.toUpperCase(), paddedKode, status_aktif, id]);
      if (result.affectedRows === 0) {
        throw new Error("Department not found");
      }
      queryLogger(pool, `nd_department`, id, query,  params);

      return {id: id, nama : nama.toUpperCase(), kode: paddedKode, status_aktif};
    }),
  },
  DocumentControl: {
    department: handleResolverError(async (parent, args, context) => {
      const query = `SELECT * FROM nd_department WHERE id = ?`;
      const [rows] = await pool.query(query, [parent.department_id]);
      return rows[0];
    }) 
  }
}

export default documentControlResolver;