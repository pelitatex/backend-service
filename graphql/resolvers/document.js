import queryLogger from "../../helpers/queryTransaction.js";
import queryTransaction from "../../helpers/queryTransaction.js";

const documentControlResolver = {
  Query:{
    document: async(_,args, context)=>{
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
    allDocument: async(_,args, context)=>{
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
  },
  Mutation: {
    addDocument: async (_, {input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      try {
        
        const {
          toko_id,
          document_control_id,
          tipe_dokumen,
          kode_toko,
          kode_dokumen,
          document_number,
          tanggal,
          dari,
          kepada,
          keterangan,
          penanggung_jawab,
          username,
          status_aktif
        } = input

        if(kode_toko.length > 2 || kode_toko.length == 0) {
          throw new Error('Kode Toko must be 2 characters');
        }
        
        if (kode_dokumen.length > 4 || kode_dokumen.length == 0) {
          throw new Error('Kode Dokumen must be 4 characters');
          
        }

        const month = new Date(tanggal).getMonth() + 1;
        const year = new Date(tanggal).getFullYear();
        let document_number_raw_new = 1;
        let document_number_new = document_number;

        pool.query('START TRANSACTION');
        pool.query('LOCK TABLES nd_document WRITE');

        switch (tipe_dokumen) {
          case 'AUTO_GENERATE_MONTHLY' || 'AUTO_GENERATE_YEARLY':
            throw new Error('surat AUTO GENERATE hanya untuk transaksi.');
          case 'GENERATE_BY_REQUEST_MONTHLY':{
            const getLastDocumentQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_control_id = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ? ORDER BY document_number_raw DESC LIMIT 1 AND status_aktif = 1`;
            const [lastDocument] = await pool.query(getLastDocumentQuery, [toko_id, document_control_id, month, year]);
            if (lastDocument.length > 0) {
              document_number_raw_new = parseFloat(lastDocument[0].document_number_raw) + 1;
            }
            document_number_new = kode_toko +':'+  
                          kode_dokumen +'/'+
                          year.toString().slice(-2) + month.toString().padStart(2,'0') +'/'+
                          document_number_raw_new.toString().padStart(4, '0');
            break;
          }
          case GENERATE_BY_REQUEST_YEARLY:{
            const getLastDocumentQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_control_id = ? AND YEAR(tanggal) = ? ORDER BY document_number_raw DESC LIMIT 1 AND status_aktif = 1`;
            const [lastDocument] = await pool.query(getLastDocumentQuery, [toko_id, document_control_id, year]);
            if (lastDocument.length > 0) {
              document_number_raw_new = parseFloat(lastDocument[0].document_number_raw) + 1;
            }
            document_number_new = kode_toko +':'+  
                                        kode_dokumen +'/'+
                                        year.toString()+'/'+
                                        document_number_raw_new.toString().padStart(4, '0');
            break;
          }
          case GENERATE_BY_REQUEST_9999:{
            const getLastDocumentQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_control_id = ? ORDER BY id DESC LIMIT 1 AND status_aktif = 1`;
            const [lastDocument] = await pool.query(getLastDocumentQuery, [toko_id, document_control_id]);
            if (lastDocument.length > 0) {
              document_number_raw_new = parseFloat(lastDocument[0].document_number_raw) + 1;
              document_number_raw_new = document_number_new > 9999 ? 1 : document_number_raw_new;
            }

            let n = Math.trunc(document_number_raw_new/100);
            document_number_new = kode_toko +':'+  
                                        kode_dokumen +'/'+
                                        n.toString().padStart(4,'0')+'/'+
                                        document_number_raw_new.toString().padStart(4, '0');
            break;
          }
          case USER_GENERATE:
            const checkQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_number = ? AND document_control_id = ? AND status_aktif = 1`;
            const [existingRows] = await pool.query(checkQuery, [toko_id, document_number_new, document_control_id]);
            if (existingRows.length > 0) {
              throw new Error('No Surat sudah pernah digunakan');
            }
            break;
          default:
            break;
        }

        const query = `INSERT INTO nd_document (toko_id, document_control_id, tanggal,
        document_number_raw, document_number, 
        dari, kepada, keterangan, 
        penanggung_jawab, username,
        status_aktif)`;
        const [result] = await pool.query(query, [toko_id, document_control_id, tanggal,
          document_number_raw_new, document_number_new,
          dari, kepada, keterangan, 
          penanggung_jawab, username, 
          status_aktif]);

        pool.query('UNLOCK TABLES nd_document');
        pool.query('COMMIT');

        return result;

      } catch (error) {
        console.error(error);
        throw new Error(error.message || "Internal Server Error Add Document");
      }
    },
    updateDocument: async (_, {id, input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      try {

        let columns = [];
        let params = [];
        let q = [];
        for (const [key, value] of Object.entries(input)) {
          columns.push(key);
          params.push(value);
          q.push('?');
        }

        const no_surat = input.no_surat;
        const toko_id = input.toko_id;

        const checkQuery = `SELECT * FROM nd_document WHERE no_surat = ? AND toko_id = ? and id != ?`;
        const [existingRows] = await pool.query(checkQuery, [no_surat, toko_id, id]);
        if (existingRows.length > 0) {
          throw new Error('No Surat sudah pernah digunakan');
        }

        const query = `UPDATE nd_document_control SET 
          nama = ?,
          kode = ?,
          keterangan = ?,
          status_aktif = ?
        WHERE id = ?`;

        const result = queryTransaction.update(context, `nd_document`, id,  query, params);
      } catch (error) {
        console.error(error);
        throw new Error(error.message || "Internal Server Error Update Document");
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