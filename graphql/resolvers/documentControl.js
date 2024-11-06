// import queryLogger from "../../helpers/queryTransaction.js";
import queryTransaction from "../../helpers/queryTransaction";

const documentControlResolver = {
  Query:{
    documentControl: async(_,args, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      try {
          const query = `SELECT * FROM nd_document_control WHERE id = ?`;
          const [rows] = await pool.query(query, [args.id]);
          return rows[0];
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Document Control Single");
      }
    },
    allDocumentControl: async(_,args, context)=>{
      try {
        const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        const query = 'SELECT * FROM nd_document_control';
        const [rows] = await pool.query(query);
        return rows;
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Document Control All");
      }
    },
    department: async(_,args, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      try {
          const query = `SELECT * FROM nd_department WHERE id = ?`;
          const [rows] = await pool.query(query, [args.id]);
          return rows[0];
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Department Single");
      }
    },
    allDepartment: async(_,args, context)=>{
      try {
        const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        const query = 'SELECT * FROM nd_department';
        const [rows] = await pool.query(query);
        return rows;
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Department All");
      }
    },
  },
  Mutation: {
    addDocumentControl: async (_, {input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      const { department_id, nama, kode, keterangan, status_aktif } = input;
      if (kode.length > 4 || kode.length == 0) {
        throw new Error('Kode must be 4 characters');
      }

      const queryLastCode = `SELECT no_kode, kode FROM nd_document_control WHERE department_id = ? AND status_aktif = 1 ORDER BY no_kode DESC LIMIT 1`;
      const [lastCodeRows] = await pool.query(queryLastCode, [department_id]);
      let paddedKode = '01';
      let newCode = 1;

      const queryGetDepartment = `SELECT * FROM nd_department WHERE id = ?`;
      const [departmentRows] = await pool.query(queryGetDepartment, [department_id]);

      const deptCode = departmentRows[0].kode;

      if (lastCodeRows.length > 0) {
        newKode = parseFloat(lastCodeRows[0].no_kode) + 1;
        paddedKode = newKode.toString().padStart(2, '0');
      }

      const newPaddedCode = `${deptCode}${paddedKode}`;


      try {

        const checkQuery = `SELECT * FROM nd_document_control WHERE nama = ? OR kode = ?`;
        const [existingRows] = await pool.query(checkQuery, [nama, paddedKode]);
        if (existingRows.length > 0) {
          throw new Error('Nama or kode already exists');
        }

        const query = `INSERT INTO nd_document_control (department_id, nama, no_kode, kode, keterangan, status_aktif) VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [department_id, nama.toUpperCase(), newKode, newCode, newPaddedCode, keterangan, status_aktif];
        const result = await queryTransaction.insert(context, "nd_document_control", query, params);
        
        /* const [result] = await pool.query(query, [department_id, nama.toUpperCase(), paddedKode, keterangan, status_aktif]);
        queryLogger(pool, `nd_document_control`, result.insertId, query, [department_id, nama.toUpperCase(), paddedKode, keterangan, status_aktif]);*/

        return result; 
      } catch (error) {
        console.error(error);
        throw new Error(error.message || "Internal Server Error Add Document Control");
      }
    },
    updateDocumentControl: async (_, {id, input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      const { department_id, nama, kode, keterangan, status_aktif } = input;
      if (kode.length > 4 || kode.length == 0) {
        throw new Error('Kode must be 4 characters');
      }
      const paddedKode = kode.padStart(4, '0');

      try {

        const checkDocumentQuery = `SELECT * FROM nd_document_control WHERE (nama = ? OR kode = ?) AND id <> ?`;
        const [existingDocumentRows] = await pool.query(checkDocumentQuery, [nama, paddedKode, id]);
        if (existingDocumentRows.length > 0) {
          throw new Error('Nama or kode already exists');
        }

        const query = `UPDATE nd_document_control SET 
          nama = ?,
          kode = ?,
          keterangan = ?,
          status_aktif = ?
        WHERE id = ?`;

        const [result] = await pool.query(query, [department_id, nama.toUpperCase(), paddedKode, keterangan, status_aktif, id]);
        if (result.affectedRows === 0) {
          throw new Error("Document Control not found");
        }
        queryLogger(pool, `nd_document_control`, result.insertId, query, [department_id, nama.toUpperCase(), paddedKode, keterangan, status_aktif]);

        return { id: id, department_id, nama : nama.toUpperCase(), kode : paddedKode, keterangan, status_aktif };
      } catch (error) {
        console.error(error);
        throw new Error(error.message || "Internal Server Error Update Document Control");
      }
    },
    addDepartment: async (_, {input}, context) => {
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

      try {
        const checkDepartmentQuery = `SELECT * FROM nd_department WHERE nama = ? OR kode = ?`;
        const [existingDepartmentRows] = await pool.query(checkDepartmentQuery, [nama, paddedKode]);
        if (existingDepartmentRows.length > 0) {
          throw new Error('Nama or kode already exists');
        }
        
        const query = `INSERT INTO nd_department (nama, kode, status_aktif) VALUES (?, ?, ?)`;
        const [result] = await pool.query(query, [nama.toUpperCase(), paddedKode, status_aktif]);
        queryLogger(pool, `nd_department`, result.insertId, query, [nama.toUpperCase(), paddedKode, status_aktif]);

        return { id: result.insertId, nama: nama.toUpperCase(), kode : paddedKode, status_aktif };
      } catch (error) {
        console.error(error);
        throw new Error(error.message || "Internal Server Error Add Department");
      }
    },
    updateDepartment: async (_, {id, input}, context) => {
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

      try {
        const checkDepartmentQuery = `SELECT * FROM nd_department WHERE (nama = ? OR kode = ?) AND id <> ?`;
        const [existingDepartmentRows] = await pool.query(checkDepartmentQuery, [nama, paddedKode, id]);
        if (existingDepartmentRows.length > 0) {
          throw new Error('Nama or kode already exists');
        }


        const query = `UPDATE nd_department SET nama = ?, kode = ?, status_aktif = ? WHERE id = ?`;
        const [result] = await pool.query(query, [nama.toUpperCase(), paddedKode, status_aktif, id]);
        if (result.affectedRows === 0) {
          throw new Error("Department not found");
        }
        queryLogger(pool, `nd_department`, id, query,  [nama.toUpperCase(), paddedKode, status_aktif, id]);

        return {id: id, nama : nama.toUpperCase(), kode: paddedKode, status_aktif};
      } catch (error) {
        console.error(error);
        throw new Error(error.message || "Internal Server Error Update Department");
      }
    },
  },
}

export default documentControlResolver;