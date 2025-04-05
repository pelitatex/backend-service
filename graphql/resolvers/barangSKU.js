import {v4 as uuidv4} from 'uuid';
// import queryLogger from "../../helpers/queryTransaction.js";
import { queryLogger } from "../../helpers/queryTransaction.js";
import handleResolverError from '../handleResolverError.js';
import { assignSingleBarangSKUToko } from '../../rabbitMQ/barangSKUToko_producers.js';

const barangSKUResolver = {
  Query:{
    barangSKU: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      // context.useSatuanLoader = true;
      const query = `SELECT * FROM nd_barang_sku WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
    }),
    allBarangSKU: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      // context.useSatuanLoader = false;
      const query = 'SELECT * FROM nd_barang_sku';
      const [rows] = await pool.query(query);
      return rows;
      
    })
  },
  Mutation:{
    addBarangSKU: handleResolverError(async(_, {input}, context) => {
      const pool = context.pool;
      const { barang_id, warna_id, satuan_id } = input;

      const getNamaBarangQuery = 'SELECT nama_jual as nama FROM nd_barang WHERE id = ?';
      const [namaBarangRows] = await pool.query(getNamaBarangQuery, [barang_id]);
      const nama = namaBarangRows.nama;

      const getWarnaJualQuery = 'SELECT warna_jual FROM nd_warna WHERE id = ?';
      const [warnaJualRows] = await pool.query(getWarnaJualQuery, [warna_id]);
      const warna_jual = warnaJualRows.warna_jual;

      
      const getSatuanQuery = 'SELECT nama FROM nd_satuan WHERE id = ?';
      const [satuanRows] = await pool.query(getSatuanQuery, [satuan_id]);
      const nama_satuan = satuanRows.nama;


      const nama_jual = nama.toUpperCase()+' '+warna_jual.toUpperCase();
      const nama_barang = nama.toUpperCase()+' '+warna_jual.toUpperCase()+' '+nama_satuan.toUpperCase();

      const barangIdStr = String(barang_id).padStart(2, '0');
      const warnaIdStr = String(warna_id).padStart(2, '0');
      const satuanIdStr = String(satuan_id).padStart(2, '0');
      const sixDigitIdentifier = barangIdStr + warnaIdStr + satuanIdStr;
      const kode = uuidv4().substring(0, 13);
      const sku_id = sixDigitIdentifier +'-'+ kode;

      const query = `INSERT INTO nd_barang_sku (sku_id, nama_barang, nama_jual, barang_id, warna_id, satuan_id, status_aktif) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
      /* const result = await queryTransaction.insert(context, "nd_barang_sku", query, params);
      return result; */

      let insertedId = null;
      try {

        const params = [sku_id, nama_barang, nama_jual, barang_id, warna_id, satuan_id, 1];
        await pool.query("START TRANSACTION");
        const [result] = await pool.query(query, params);
        insertedId = result.insertId;
        await pool.query("COMMIT");
        queryLogger(pool, `nd_barang_sku`, insertedId, query, params);
        
      } catch (error) {
        await pool.query("ROLLBACK");
        throw error;
      }

      await assignSingleBarangSKUToko(insertedId,pool);

      return {id: insertedId, sku_id, nama_barang, nama_jual, barang_id, warna_id, satuan_id, status_aktif:1};
    }),
    addBarangSKUBulk: handleResolverError(async(_, {input}, context) => {
      const pool = context.pool;
      
      const newItems = [];
      const barangIdSet = new Set();
      const warnaIdSet = new Set();
      const satuanIdSet = new Set();
      const skuIidInserted = [];
      const status_aktif = 1;
      
      for (const item of input) {
        
        const { barang_id, warna_id, satuan_id } = item;
        if(!barangIdSet.has(barang_id)) {
          barangIdSet.add(barang_id);
        }
        if(!warnaIdSet.has(warna_id)) {
          warnaIdSet.add(warna_id);
        }
        if(!satuanIdSet.has(satuan_id)) {
          satuanIdSet.add(satuan_id);
        }

      };

      const barangIdKey = {};
      const warnaIdKey = {};
      const satuanIdKey = {};

      const getNamaBarangQuery = 'SELECT nama_jual as nama FROM nd_barang WHERE id IN (?)';
      const [namaBarangRows] = await pool.query(getNamaBarangQuery, [[...barangIdSet].join(',')]);
      for (const row of namaBarangRows) {
        barangIdKey[row.id] = row.nama;
      }

      const getWarnaJualQuery = 'SELECT warna_jual FROM nd_warna WHERE id IN (?)';
      const [warnaJualRows] = await pool.query(getWarnaJualQuery, [[...warnaIdSet].join(',')]);
      for (const row of warnaJualRows) {
        warnaIdKey[row.id] = row.warna_jual;
      }
      
      const getSatuanQuery = 'SELECT nama FROM nd_satuan WHERE id IN (?)';
      const [satuanRows] = await pool.query(getSatuanQuery, [[...satuanIdSet].join(',')]);
      for (const row of satuanRows) {
        satuanIdKey[row.id] = row.nama;
      }
      
      for (const item of input){

        const { barang_id, warna_id, satuan_id } = item;
        const nama = barangIdKey[barang_id];
        const warna_jual = warnaIdKey[warna_id];        
        const nama_satuan = satuanIdKey[satuan_id];
  
  
        const nama_jual = nama.toUpperCase()+' '+warna_jual.toUpperCase();
        const nama_barang = nama.toUpperCase()+' '+warna_jual.toUpperCase()+' '+nama_satuan.toUpperCase();
  
          
        const barangIdStr = String(barang_id).padStart(2, '0');
        const warnaIdStr = String(warna_id).padStart(2, '0');
        const satuanIdStr = String(satuan_id).padStart(2, '0');
        const sixDigitIdentifier = barangIdStr + warnaIdStr + satuanIdStr;
        const kode = uuidv4().substring(0, 13);
        const sku_id = sixDigitIdentifier +'-'+ kode;
        newItems.push({
          sku_id:sku_id, 
          nama_barang:nama_barang, 
          nama_jual:nama_jual, 
          barang_id:barang_id, 
          warna_id:warna_id, 
          satuan_id:satuan_id, 
          status_aktif:status_aktif
        });
        skuIidInserted.push(sku_id);
      }

      
      const namaBarangSet = new Set();
      for (const item of newItems) {
        if (namaBarangSet.has(item[1])) {
          console.warn(`Duplicate nama_barang found: ${item[1]}`);
        }else{
          namaBarangSet.add(item[1]);
        }

      }

      const placeholder = newItems.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
      const query = `INSERT INTO nd_barang_sku (sku_id, nama_barang, nama_jual, barang_id, warna_id, satuan_id, status_aktif) VALUES ${placeholder}`;
      // console.log('placeholder',placeholder);

      const params = newItems.flatMap(item=>[item.sku_id, item.nama_barang, item.nama_jual, item.barang_id, item.warna_id, item.satuan_id, item.status_aktif]);
      /* const result = await queryTransaction.insert(context, "nd_barang_sku", query, params);
      return result; */

      let insertedId = null;
      try {
        await pool.query("START TRANSACTION");
        const [result] = await pool.query(query, params);
        const affectedRows = result.affectedRows;
        await pool.query("COMMIT");
        if (affectedRows === 0) {
          throw new Error('No rows inserted');
        }
      } catch (error) {
        await pool.query("ROLLBACK");
        throw error;
      }

      queryLogger(pool, `nd_barang_sku`, 0, query, params);

      // await assignSingleBarangSKUToko(insertedId,pool);

      const [resultInserted] = await pool.query(`SELECT * from nd_barang_sku WHERE sku_id IN (?)`, skuIidInserted.join(','));
      
      return resultInserted;
    }),
    /*updateBarangSKU: handleResolverError(async (_, {id, input}, context) => {
      const pool = context.pool;
      
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

      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        throw new Error('Barang SKU not found');
      }
      queryLogger(pool, `nd_barang_sku`, id, query, params);

      const updatedQuery = `SELECT * FROM nd_barang_sku WHERE id = ?`;
      const [rows] = await pool.query(updatedQuery, [id]);
      return rows[0];
    }),*/
  }
}

export default barangSKUResolver;