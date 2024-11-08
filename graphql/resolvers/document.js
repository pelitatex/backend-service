// import queryLogger from "../../helpers/queryTransaction.js";
import queryTransaction from "../../helpers/queryTransaction.js";
const MAX_LIMIT = 100;

const documentResolver = {
  Query:{
    document: async(_,args, context)=>{
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      try {
          const query = `SELECT * FROM nd_document WHERE id = ?`;
          const [rows] = await pool.query(query, [args.id]);
          const response = {
            id: rows[0].id,
            toko_id: rows[0].toko_id,
            document_control_id: rows[0].document_control_id,
            tanggal: rows[0].tanggal,
            document_number: rows[0].document_number,
            judul: rows[0].judul,
            dari: rows[0].dari,
            kepada: rows[0].kepada,
            keterangan: zlib.gunzipSync(rows[0].keterangan).toString(),
            penanggung_jawab: rows[0].penanggung_jawab,
            username: rows[0].username,
            status_aktif: rows[0].status_aktif
          }
          return rows[0];
      } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error Document Control Single");
      }
    },
    allDocument: async(_,{offset=0, limit = 10}, context)=>{
      const limitQuery = limit > MAX_LIMIT ? MAX_LIMIT : limit;
      try {
        const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        const query = `SELECT * FROM nd_document LIMIT ?, ?`;
        const [rows] = await pool.query(query, [offset, limitQuery]);
        const response = rows.map(row => {
          return {
            id: row.id,
            toko_id: row.toko_id,
            document_control_id: row.document_control_id,
            tanggal: row.tanggal,
            document_number: row.document_number,
            judul: row.judul,
            dari: row.dari,
            kepada: row.kepada,
            keterangan: zlib.gunzipSync(row.keterangan).toString(),
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
          case GENERATE_BY_REQUEST_YEARLY:{
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
          case GENERATE_BY_REQUEST_9999:{
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
          case USER_GENERATE:{
            const checkQuery = `SELECT * FROM nd_document WHERE toko_id = ? AND document_number = ? AND document_control_id = ? AND status_aktif = 1`;
            const [existingRows] = await pool.query(checkQuery, [toko_id, document_number_new, document_control_id]);
            if (existingRows.length > 0) {
              throw new Error('No Surat sudah pernah digunakan');
            }
            break;
          }
          default:
            console.log("bingung  tipe_dokumen");
        }

        console.log('new document raw number', document_number_raw_new);
        console.log('new document number', document_number_new);

        const query = `INSERT INTO nd_document (toko_id, document_control_id, tanggal,
        document_number_raw, document_number, 
        judul, dari, kepada, keterangan, 
        penanggung_jawab, username,
        status_aktif)
        VALUES (?, ?, ?, 
        ?, ?,  
        ?, ?, ?, ?, 
        ?, ?, 
        ?)
        `;

        const ketCompress = zlib.gzipSync(keterangan);

        const params = [toko_id, document_control_id, tanggal,
          document_number_raw_new, document_number_new,
          judul, dari, kepada, ketCompress, 
          penanggung_jawab, username, 
          status_aktif];
        const [result] = await pool.query(query, params);

          console.log('inserted document');

          await pool.query('UNLOCK TABLES;');
          console.log('unlocked tables');
          await pool.query('COMMIT;');

          const logQuery = `INSERT INTO query_log (table_name, affected_id, query, params, username) 
          VALUES (?, ?, ?, ?, ?)`;

          const paramsLogger = [toko_id, document_control_id, tanggal, document_number_raw_new, document_number_new, judul, dari, kepada, ketCompress, penanggung_jawab, username, status_aktif];
          await pool.query(logQuery, ["nd_document", result.insertId, query, JSON.stringify(paramsLogger), username] );

        return {id: result.insertId, toko_id, document_control_id, tanggal, document_number : document_number_new, dari, kepada, keterangan, penanggung_jawab, username, status_aktif};

      } catch (error) {
        await pool.query('ROLLBACK');
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

        const { 
          judul,
          dari, 
          kepada, 
          keterangan,
          penanggung_jawab,
          username,
          status_aktif } = input 

        if(keterangan.length > 2000) {
          throw new Error('Keterangan must be less than 2000 characters');
        }

        const query = `UPDATE nd_document SET
          judul = ?, 
          dari = ?,
          kepada = ?,
          keterangan = ?,
          penanggung_jawab = ?,
          username = ?,
          status_aktif = ?
          WHERE id = ?`;
        const ketCompress = zlib.gzipSync(keterangan);

        const params = [judul, dari, kepada, ketCompress, penanggung_jawab, username, status_aktif, id];

        await pool.query('START TRANSACTION;');
        const [result] = await pool.query(query, params);
        if (result.affectedRows === 0) {
          throw new Error("Document not found");
        }

        const logQuery = `INSERT INTO query_log (table_name, affected_id, query, params, username) 
          VALUES (?, ?, ?, ?, ?)`;

        const paramsLogger = [toko_id, document_control_id, tanggal, document_number_raw_new, document_number_new, judul, dari, kepada, ketCompress, penanggung_jawab, username, status_aktif];
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
    }
  },
}

export default documentResolver;