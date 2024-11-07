import {v4 as uuidv4} from 'uuid';
// import queryLogger from "../../helpers/queryTransaction.js";
import queryTransaction from '../../helpers/queryTransaction.js';

const barangSKUResolver = {
  Query:{
    barangSKU: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        try {
          context.useSatuanLoader = true;
          const query = `SELECT * FROM nd_barang_sku WHERE id = ?`;
          const [rows] = await pool.query(query, [args.id]);
          return rows[0];
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Barang SKU Single");
        }
    },
    allBarangSKU: async(_,args, context)=>{
      const pool = context.pool;
        if (!pool) {
          console.log('context', pool);
          throw new Error('Database pool not available in context.');
        }
        try {
          context.useSatuanLoader = false;
          const query = 'SELECT * FROM nd_barang_sku';
          const [rows] = await pool.query(query);
          return rows;
        } catch (error) {
          console.error(error);
          throw new Error("Internal Server Error Barang SKU All");
        }
    }
  },
  Mutation:{
    addBarangSKU: async (_, {input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      const { barang_id, warna_id, satuan_id, status_aktif } = input;

      const getNamaBarangQuery = 'SELECT nama_jual as nama FROM nd_barang WHERE id = ?';
      const [namaBarangRows] = await pool.query(getNamaBarangQuery, [barang_id]);
      const nama = namaBarangRows[0].nama;

      const getWarnaJualQuery = 'SELECT warna_jual FROM nd_warna WHERE id = ?';
      const [warnaJualRows] = await pool.query(getWarnaJualQuery, [warna_id]);
      const warna_jual = warnaJualRows[0].warna_jual;
      
      const getSatuanQuery = 'SELECT nama FROM nd_satuan WHERE id = ?';
      const [satuanRows] = await pool.query(getSatuanQuery, [satuan_id]);
      const nama_satuan = satuanRows[0].nama;

      const nama_jual = nama.toUpperCase()+' '+warna_jual.toUpperCase();
      const nama_barang = nama.toUpperCase()+' '+warna_jual.toUpperCase()+' '+nama_satuan.toUpperCase();

      const checkExistQuery = 'SELECT * FROM nd_barang_sku WHERE nama_barang = ?';
      const [existRows] = await pool.query(checkExistQuery, [nama_barang]);
      if (existRows.length > 0) {
        throw new Error('Barang SKU already exists.');
      }

      const barangIdStr = String(barang_id).padStart(2, '0');
      const warnaIdStr = String(warna_id).padStart(2, '0');
      const satuanIdStr = String(satuan_id).padStart(2, '0');
      const sixDigitIdentifier = barangIdStr + warnaIdStr + satuanIdStr;
      const kode = uuidv4().substring(0, 13);

      try {
        const sku_id = sixDigitIdentifier +'-'+ kode;
        const query = 'INSERT INTO nd_barang_sku (sku_id, nama_barang, nama_jual, barang_id, warna_id, satuan_id, status_aktif) VALUES (?, ?, ?, ?, ?, ?, ?)';

        const params = [sku_id, nama_barang, nama_jual, barang_id, warna_id, satuan_id, status_aktif];
        const result = await queryTransaction.insert(context, "nd_barang_sku", query, params);
        return result;

        /* const [result] = await pool.query(query, [sku_id, nama_barang, nama_jual, barang_id, warna_id, satuan_id, status_aktif]);
        const insertedId = result.insertId;
        queryLogger(pool, `nd_barang_sku`, result.insertId, query, [sku_id, nama_barang, nama_jual, barang_id, warna_id, satuan_id, status_aktif]);
        return {id: insertedId, sku_id, nama_barang, nama_jual, barang_id, warna_id, satuan_id, status_aktif};*/
      } catch (error) { 
        console.error(error);
        throw new Error('Internal Server Error Add Barang');
      }
    },
    updateBarangSKU: async (_, {id, input}, context) => {
      const pool = context.pool;
      if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
      }

      const { nama_barang, nama_jual, status_aktif } = input;
      try {
        const checkExistQuery = 'SELECT * FROM nd_barang_sku WHERE nama_barang = ? and id <> ?';
        const [existRows] = await pool.query(checkExistQuery, [nama_barang, id]);
        
        if (existRows.length > 0) {
          throw new Error('Barang SKU already exists.');
        }

        if(nama_jual === null || nama_jual === '') {
          const getNamaBarangQuery = 'SELECT nama_jual as nama FROM nd_barang WHERE id = ?';
          const [namaBarangRows] = await pool.query(getNamaBarangQuery, [barang_id]);
          const nama = namaBarangRows[0].nama;

          const getWarnaJualQuery = 'SELECT warna_jual FROM nd_warna WHERE id = ?';
          const [warnaJualRows] = await pool.query(getWarnaJualQuery, [warna_id]);
          const warna_jual = warnaJualRows[0].warna_jual;

          nama_jual = nama.toUpperCase()+' '+warna_jual.toUpperCase();
        }

        const query = 'UPDATE nd_barang_sku SET nama_barang = ?, nama_jual = ?, status_aktif = ? WHERE id = ?';
        const params = [nama_barang.toUpperCase(), nama_jual.toUpperCase(), status_aktif, id];
        const result = await queryTransaction.update(context, "nd_barang_sku", id, query, params);
        return result;

        /* const [result] = await pool.query(query, [nama_barang.toUpperCase(), nama_jual.toUpperCase(), status_aktif, id]);
        if (result.affectedRows === 0) {
          throw new Error('Barang SKU not found');
        }
        queryLogger(pool, `nd_barang_sku`, id, query, [nama_barang.toUpperCase(), nama_jual.toUpperCase(), status_aktif, id]);

        const updatedQuery = `SELECT * FROM nd_barang_sku WHERE id = ?`;
        const [rows] = await pool.query(updatedQuery, [id]);
        return rows[0]; */

      } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error Update Barang');
      }
    },
  }
}

export default barangSKUResolver;