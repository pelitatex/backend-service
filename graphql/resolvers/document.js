import { stat } from 'fs';
import zlib from 'zlib';

// import queryLogger from "../../helpers/queryTransaction.js";
// import queryTransaction from "../../helpers/queryTransaction.js";
const MAX_LIMIT = 100;

const documentResolver = {
  Query:{
    document: async(_,args, context, info)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      try {
          const query = `SELECT * FROM nd_document WHERE id = ?`;
          const [rows] = await pool.query(query, [args.id]);

          if (rows.length === 0) {
            throw new Error("Document not found");
          }
          /* const text = "123456789ABCDEF";
          const ketCompress = zlib.deflateSync(text).toString('base64'); */
          const text = zlib.inflateSync(Buffer.from(rows[0].keterangan, 'base64')).toString();

          const response = {
            id: rows[0].id,
            toko_id: rows[0].toko_id,
            document_control_id: rows[0].document_control_id,
            tanggal: rows[0].tanggal,
            document_number_raw: rows[0].document_number_raw,
            document_number: rows[0].document_number,
            document_status: rows[0].document_status,
            judul: rows[0].judul,
            dari: rows[0].dari,
            kepada: rows[0].kepada,
            keterangan: text,
            penanggung_jawab: rows[0].penanggung_jawab,
            username: rows[0].username,
            status_aktif: rows[0].status_aktif
          }
          return response;
      } catch (error) {
        console.error(error);
        throw new Error(error.message || "Internal Server Error Document Control Single");
      }
    },
    allDocument: async(_,{offset=0, limit = 10, search="", toko_id = 0, departemen_id = 0 }, context)=>{
      const limitQuery = limit > MAX_LIMIT ? MAX_LIMIT : limit;
      const toko_id_filter = toko_id;
      const departemen_id_filter = departemen_id;
      try {
        const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }

        let query = `SELECT t1.* FROM (
          SELECT * nd_document `;
        let params = [];
        
        let cond_dept = "";
        let cond_toko = "";
        let cond_search = "";

        let param_dept = [];
        let param_toko = [];
        let param_search = [];

        if (toko_id_filter != 0 && toko_id_filter != "") {
          cond_toko = `WHERE toko_id = ?`;
          param_toko.push(toko_id_filter);
        }

        if (departemen_id_filter != 0 && departemen_id_filter != "") {
          cond_dept = ` WHERE department_id = ? `;
          param_dept.push(departemen_id_filter);
        }

        if (search.length > 0) {
          cond_search = `
          AND ( document_number LIKE ? 
          OR judul LIKE ?
          OR tanggal LIKE ? )`;
          param_search.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query = `SELECT t1.* 
        FROM (
          SELECT * FROM nd_document
          LIKE ?
          ${cond_toko}
        ) t1 
        LEFT JOIN (
          SELECT *
          FROM nd_document_control 
          ${cond_dept}
        ) t2
        ON t1.document_control_id = t2.id 
        WHERE t2.id IS NOT NULL 
        ${cond_search}
        LIMIT ? , ?`;

        params = [
          ...(param_toko.length ? param_toko : []),
          ...(param_toko.dept ? param_dept : []),
          ...(param_search.length ? param_search : []),
          offset,
          limitQuery
        ];
        
        

        const [rows] = await pool.query(query, params);
        const response = rows.map(row => {
          const text = zlib.inflateSync(Buffer.from(row.keterangan, 'base64')).toString().substring(0, 50);
          return {
            id: row.id,
            toko_id: row.toko_id,
            document_control_id: row.document_control_id,
            tanggal: row.tanggal,
            document_number_raw: row.document_number_raw,
            document_number: row.document_number,
            document_status: row.document_status,
            judul: row.judul,
            dari: row.dari,
            kepada: row.kepada,
            keterangan: text,
            penanggung_jawab: row.penanggung_jawab,
            username: row.username,
            status_aktif: row.status_aktif
          }
        });
        return response;
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Document Control All");
      }
    },
  },
  Document: {
    document_control: async(parent,args,context)=> {

      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      try {
        const query = `SELECT * FROM nd_document_control WHERE id = ?`;
        const [rows] = await pool.query(query, [parent.document_control_id]);
        const response = rows[0];

        console.log(response);
        return response;
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Document Control From Document Single");
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
          document_status,
          document_number,
          tanggal,
          judul,
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

        if(keterangan.length > 3000) {
          throw new Error('Keterangan must be less than 3000 characters');
        }

        const month = new Date(tanggal).getMonth() + 1;
        const year = new Date(tanggal).getFullYear();
        let document_number_raw_new = 1;
        let document_number_new = document_number;

        await pool.query('START TRANSACTION;');
        await pool.query('LOCK TABLES nd_document WRITE;');

        console.log('start transaction');
        console.log('lock tables');

        if(document_status == 'APPROVED') {
          switch (tipe_dokumen) {
            case 'AUTO_GENERATE_MONTHLY' || 'AUTO_GENERATE_YEARLY':{
              throw new Error('surat AUTO GENERATE hanya untuk transaksi.');
            }
            case 'GENERATE_BY_REQUEST_MONTHLY':{
              const getLastDocumentQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_control_id = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?  AND status_aktif = 1 ORDER BY document_number_raw DESC LIMIT 1`;
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
            case 'GENERATE_BY_REQUEST_YEARLY':{
              const getLastDocumentQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_control_id = ? AND YEAR(tanggal) = ? AND status_aktif = 1 ORDER BY document_number_raw DESC LIMIT 1`;
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
            case 'GENERATE_BY_REQUEST_9999':{
              const getLastDocumentQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_control_id = ? AND status_aktif = 1 ORDER BY id DESC LIMIT 1`;
              const [lastDocument] = await pool.query(getLastDocumentQuery, [toko_id, document_control_id]);
              if (lastDocument.length > 0) {
                document_number_raw_new = parseFloat(lastDocument[0].document_number_raw) + 1;
              }

              let n = Math.trunc(document_number_raw_new/10000);
              const no_dok = document_number_raw_new % 10000;
              document_number_new = kode_toko +':'+  
                                          kode_dokumen +'/'+
                                          n.toString().padStart(4,'0')+'/'+
                                          no_dok.toString().padStart(4, '0');
              break;
            }
            case 'USER_GENERATE':{
              const checkQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_number = ? AND document_control_id = ? AND status_aktif = 1`;
              const [existingRows] = await pool.query(checkQuery, [toko_id, document_number_new, document_control_id]);
              if (existingRows.length > 0) {
                throw new Error('No Surat sudah pernah digunakan');
              }
              break;
            }
            default:
              console.log("tipe_dokumen is not allowed to stored thgis way");
          }
        }else{
          document_number_raw_new = null;
          document_number_new = null;
        }

        const query = `INSERT INTO nd_document (toko_id, document_control_id, tanggal,
        document_number_raw, document_number, document_status,
        judul, dari, kepada, keterangan, 
        penanggung_jawab, username,
        status_aktif)
        VALUES (?, ?, ?, 
        ?, ?, ?,
        ?, ?, ?, ?, 
        ?, ?, 
        ?)
        `;

        const text = keterangan;
        const ketCompress = zlib.deflateSync(text).toString('base64');

        const params = [toko_id, document_control_id, tanggal,
          document_number_raw_new, document_number_new, document_status,
          judul, dari, kepada, ketCompress, 
          penanggung_jawab, username, 
          status_aktif];
        console.log('params', params);
        const [result] = await pool.query(query, params);

          console.log('inserted document');

          await pool.query('UNLOCK TABLES;');
          console.log('unlocked tables');
          await pool.query('COMMIT;');

          const logQuery = `INSERT INTO query_log (table_name, affected_id, query, params, username) 
          VALUES (?, ?, ?, ?, ?)`;

          const paramsLogger = [toko_id, document_control_id, tanggal, document_number_raw_new, document_number_new, document_status, judul, dari, kepada, ketCompress, penanggung_jawab, username, status_aktif];
          await pool.query(logQuery, ["nd_document", result.insertId, query, JSON.stringify(paramsLogger), username] );

        return {id: result.insertId, toko_id, document_control_id, tanggal, document_number : document_number_new, document_status, judul, dari, kepada, keterangan, penanggung_jawab, username, status_aktif};

      } catch (error) {
        console.log('failed transaction');
        console.log('unlocked tables');

        await pool.query('UNLOCK TABLES;');
        await pool.query('ROLLBACK');
        console.error(error);
        throw new Error("Internal Server Error Add Document");
      }
    },
    updateDocument: async (_, {id, input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      try {

        let {
          toko_id,
          document_control_id,
          tipe_dokumen,
          kode_toko,
          kode_dokumen,
          document_status,
          document_number,
          tanggal,
          judul,
          dari, 
          kepada, 
          keterangan,
          penanggung_jawab,
          username,
          status_aktif } = input 

        /* const queryGet = "SELECT * FROM nd_document WHERE id = ?";
        const [rows] = await pool.query(queryGet, [id]);
        const toko_id = rows[0].toko_id;
        const document_control_id = rows[0].document_control_id;
        const tanggal = rows[0].tanggal;
        const document_number_raw = rows[0].document_number_raw;
        const document_number = rows[0].document_number; */


        if(keterangan.length > 3000) {
          throw new Error('Keterangan must be less than 2000 characters');
        }

        const month = new Date(tanggal).getMonth() + 1;
        const year = new Date(tanggal).getFullYear();

        const queryGet = "SELECT * FROM nd_document WHERE id = ?";
        const [rows] = await pool.query(queryGet, [id]);

        const document_number_awal = (rows[0].document_number == null) ? '' : rows[0].document_number;
        const document_control_id_awal = rows[0].document_control_id;
        const toko_id_awal = rows[0].toko_id;

        if (document_number_awal !== '' && tipe_dokumen !== 'USER_GENERATE') {

          if (document_control_id_awal != document_control_id) {
            throw new Error('No Surat sudah di register, jenis Dokumen tidak boleh diubah');
          }

          if (toko_id_awal != toko_id) {
            throw new Error('No Surat sudah di register, Toko tidak boleh diubah');
          }

          const tanggal_awal = rows[0].tanggal;
  
          const month_awal = new Date(tanggal_awal).getMonth() + 1;
          const year_awal = new Date(tanggal_awal).getFullYear();

          if(month_awal != month || year_awal != year) {
            throw new Error('No Surat sudah di register, Bulan dan tahun tidak boleh diubah');
          }
          
          document_number = document_number_awal;
          document_number_raw = rows[0].document_number_raw;
        }

        if(document_status == 'APPROVED' &&  document_number_awal == "") {

          switch (tipe_dokumen) {
            case 'AUTO_GENERATE_MONTHLY' || 'AUTO_GENERATE_YEARLY':{
              throw new Error('surat AUTO GENERATE hanya untuk transaksi.');
            }
            case 'GENERATE_BY_REQUEST_MONTHLY':{
              const getLastDocumentQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_control_id = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?  AND status_aktif = 1 ORDER BY document_number_raw DESC LIMIT 1`;
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
            case 'GENERATE_BY_REQUEST_YEARLY':{
              const getLastDocumentQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_control_id = ? AND YEAR(tanggal) = ? AND status_aktif = 1 ORDER BY document_number_raw DESC LIMIT 1`;
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
            case 'GENERATE_BY_REQUEST_9999':{
              const getLastDocumentQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_control_id = ? AND status_aktif = 1 ORDER BY id DESC LIMIT 1`;
              const [lastDocument] = await pool.query(getLastDocumentQuery, [toko_id, document_control_id]);
              if (lastDocument.length > 0) {
                document_number_raw_new = parseFloat(lastDocument[0].document_number_raw) + 1;
              }

              let n = Math.trunc(document_number_raw_new/10000);
              const no_dok = document_number_raw_new % 10000;
              document_number_new = kode_toko +':'+  
                                          kode_dokumen +'/'+
                                          n.toString().padStart(4,'0')+'/'+
                                          no_dok.toString().padStart(4, '0');
              break;
            }
            default:
              console.log("tipe_dokumen is not allowed to stored this way");
          }
        }else if(tipe_dokumen == 'USER_GENERATE' && document_status == 'APPROVED') {
          const document_number_new = document_number;

          const checkQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_number = ? AND document_control_id = ? AND status_aktif = 1`;
          const [existingRows] = await pool.query(checkQuery, [toko_id, document_number_new, document_control_id]);
          if (existingRows.length > 0) {
            throw new Error('No Surat sudah pernah digunakan');
          }
        }

        const query = `UPDATE nd_document SET
          document_status = ?,
          judul = ?, 
          dari = ?,
          kepada = ?,
          keterangan = ?,
          penanggung_jawab = ?,
          username = ?,
          status_aktif = ?
          WHERE id = ?`;
          
        const text = keterangan;
        const ketCompress = zlib.deflateSync(text).toString('base64');

        const params = [document_status, judul, dari, kepada, ketCompress, penanggung_jawab, username, status_aktif, id];

        await pool.query('START TRANSACTION;');
        const [result] = await pool.query(query, params);
        if (result.affectedRows === 0) {
          throw new Error("Document not found");
        }

        const logQuery = `INSERT INTO query_log (table_name, affected_id, query, params, username) 
          VALUES (?, ?, ?, ?, ?)`;

        const paramsLogger = [document_status, judul, dari, kepada, ketCompress, penanggung_jawab, username, status_aktif];
        await pool.query(logQuery, ["nd_document", id, query, JSON.stringify(paramsLogger), username] ); 
        const res = await pool.query(`SELECT * FROM nd_document WHERE id = ?`, [id]);
        await pool.query('COMMIT;');
        const respond = {};
        Object.assign(respond, res[0][0]);
        
        return respond;


      } catch (error) {
        console.error(error);
        throw new Error(error.message || "Internal Server Error Update Document");
      }
    },
    uploadDocument: async (_, {id, input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      const {
        toko_id,
        document_control_id,
        kode_toko,
        kode_dokumen,
        username,
        data
      } = input;

      if (!data) {
        throw new Error("File is required");
      }

      if (!toko_id) {
        throw new Error("Toko is required");
      }

      if(document_control_id == null) {
        throw new Error("Jenis Control is required");
      }

      let newData = [];
      try {

        const queryCheck = `SELECT * FROM nd_document_control WHERE id = ${document_control_id}`;
        const [resultCheck] = await pool.query(queryCheck, id);
        if (resultCheck.affectedRows === 0) {
          throw new Error("Jenis Document not found");
        }

        const tipe_dokumen = resultCheck[0].tipe_dokumen;
        if(tipe_dokumen != 'USER_GENERATE') {
          throw new Error("Jenis Document not allowed to upload file");
        }else{

          const all_number = data.map((item) => {
            return item.document_number.toString().trim();
          });

          const queryNumberCheck = `SELECT * FROM nd_document where document_number IN (?) AND toko_id = ? AND status_aktif = 1`;
          const [resultNumberCheck] = await pool.query(queryNumberCheck, [all_number, toko_id]);
          if (resultNumberCheck.length > 0) {
            const existing_number = resultNumberCheck.map((item) => {
              return item.document_number;
            });
            throw new Error(`Document Number ${existing_number.join(',')} already exist`);
          }else{
            // console.log(all_number.join(','), toko_id);
          }

          data.forEach( (item, index) => {
            let tanggal = item.tanggal;
            let judul = item.judul;
            let keterangan = item.keterangan;
            let document_number = item.document_number;
            let document_number_raw = item.document_number.toString().trim();

            if (item.tanggal == null || item.tanggal == "") {
              throw new Error("Tanggal is required");              
            }

            if (item.judul == null || item.judul == "") {
              throw new Error("Judul is required");              
            }

            if(item.document_number == null || item.document_number == "") {
              throw new Error("Document Number is required");
            }

            const text = zlib.deflateSync(keterangan).toString('base64');
            newData.push(toko_id, document_control_id, tanggal, document_number_raw, document_number, 'APPROVED', judul, "", "", text, "", username, 1);
            // console.log('newData'+index, newData);
            
            /* return {
              toko_id: toko_id,
              document_control_id: document_control_id,
              document_number_raw: document_number_raw,
              document_number: document_number,
              tanggal: tanggal,
              judul: judul,
              dari: "",
              kepada: "",
              penanggung_jawab: "",
              username: username,
              status_aktif: 1,
              document_status: 'APPROVED',
              keterangan: keterangan,
            } */
          });
        }

        const placeholders = data.map(() => `(?,?,?,?,?,?,?,?,?,?,?,?,?)`).join(','); 

        await pool.query('START TRANSACTION;');
        const query = `INSERT INTO nd_document (toko_id, document_control_id, tanggal,
        document_number_raw, document_number, document_status,
        judul, dari, kepada, keterangan, 
        penanggung_jawab, username,
        status_aktif)
        VALUES ${placeholders}
        `;

        const [result] = await pool.query(query, newData);
        
        const firstId = result.insertId;
        const rowsAffected = result.affectedRows;
        await pool.query('COMMIT;');

        const [newRows] = await pool.query(`SELECT * FROM nd_document WHERE id >= ? AND id < ?`, [firstId, firstId + rowsAffected]);
        const response = newRows.map(row => {

          const text = zlib.inflateSync(Buffer.from(row.keterangan, 'base64')).toString().substring(0, 50);
          return {
            id: row.id,
            toko_id: row.toko_id,
            document_control_id: row.document_control_id,
            tanggal: row.tanggal,
            document_number_raw: row.document_number_raw,
            document_number: row.document_number,
            document_status: row.document_status,
            judul: row.judul,
            dari: row.dari,
            kepada: row.kepada,
            keterangan: text,
            penanggung_jawab: row.penanggung_jawab,
            username: row.username,
            status_aktif: row.status_aktif
          }
        });
        return response;

      } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        throw new Error(error.message || "Internal Server Error Upload Document");
      }
    },
  },
}

export default documentResolver;