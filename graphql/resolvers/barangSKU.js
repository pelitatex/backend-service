import {v4 as uuidv4} from 'uuid';
// import queryLogger from "../../helpers/queryTransaction.js";
import { queryLogger } from "../../helpers/queryTransaction.js";
import handleResolverError from '../handleResolverError.js';
import { assignSingleBarangSKUToko, assignSelectedBarangSKUToko } from '../../rabbitMQ/barangSKUToko_producers.js';

function chunckArray(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
}


const barangSKUResolver = {
  Query:{
    barangSKU: handleResolverError(async(_,args, context)=>{
      const pool = context.pool;
      // context.useSatuanLoader = true;
      const query = `SELECT * FROM nd_barang_sku WHERE id = ?`;
      const [rows] = await pool.query(query, [args.id]);
      return rows[0];
    }),
    allBarangSKU: handleResolverError(async(_, args, context) => {
      const pool = context.pool;

      const { offset = 0, limit = 10, search="" } = args;
      let condQuery = "";
      let query = "";
      let rows = [];

      if(search !== "") {
        query = 'SELECT * FROM nd_barang_sku WHERE (sku_id LIKE ? OR nama_barang LIKE ? OR nama_jual LIKE ?) LIMIT ? OFFSET ?';
        [rows] = await pool.query(query, [`%${search}%`, `%${search}%`, `%${search}%`, limit, offset]);
      }else{
        query = 'SELECT * FROM nd_barang_sku LIMIT ? OFFSET ?';
        [rows] = await pool.query(query, [limit, offset]);
      }

      return rows;
    })
  },
  Mutation:{
    addBarangSKU: handleResolverError(async(_, {input}, context) => {
      const pool = context.pool;
      const { barang_id, warna_id, satuan_id } = input;

      console.log(input);

      const getNamaBarangQuery = 'SELECT nama_jual as nama FROM nd_barang WHERE id = ?';
      const [namaBarangRows] = await pool.query(getNamaBarangQuery, [barang_id]);
      const nama = namaBarangRows.nama;

      const getWarnaJualQuery = 'SELECT warna_jual as nama_warna FROM nd_warna WHERE id = ?';
      const [warnaJualRows] = await pool.query(getWarnaJualQuery, [warna_id]);
      const warna_jual = warnaJualRows.warna_jual;

      
      const getSatuanQuery = 'SELECT nama FROM nd_satuan WHERE id = ?';
      const [satuanRows] = await pool.query(getSatuanQuery, [satuan_id]);
      const nama_satuan = satuanRows.nama;

      console.log('nama_barang', nama);
      console.log('warna_jual', warna_jual);

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
        await queryLogger(pool, `nd_barang_sku`, insertedId, query, params);
        
      } catch (error) {
        await pool.query("ROLLBACK");
        throw error;
      }

      await assignSingleBarangSKUToko(insertedId,pool);

      return {id: insertedId, sku_id, nama_barang, nama_jual, barang_id, warna_id, satuan_id, status_aktif:1};
    }),
    generateBarangSKUBulk: handleResolverError(async(_, {input}, context) => {
      const pool = context.pool;
      const inputLength = input.barangSKU.length;
      if(inputLength > 3000){
        throw new Error('Input array exceeds the maximum length of 5000 items.');
      }
      
      let batchSize = 40;
      
      console.log('inputLength', inputLength);
      console.log('input', input.barangSKU);
      const chunkedInput = chunckArray(input.barangSKU, batchSize);
      

      const result = [];

      for (const chunk of chunkedInput ) {
        console.log('chunk', chunk);

        const barangIdList = new Set();
        const warnaIdList = new Set();
        const satuanIdList = new Set();

        for (const item of chunk) {
          const { barang_id, warna_id, satuan_id } = item;
          barangIdList.add(barang_id);
          warnaIdList.add(warna_id);
          satuanIdList.add(satuan_id);
        }

        const getNamaBarangQuery = 'SELECT id,nama_jual as nama FROM nd_barang WHERE id IN (?)';
        const [namaBarangRows] = await pool.query(getNamaBarangQuery, [Array.from(barangIdList)]);

                
        const getWarnaJualQuery = 'SELECT id,warna_jual as nama_warna FROM nd_warna WHERE id IN (?)';
        const [warnaJualRows] = await pool.query(getWarnaJualQuery, [Array.from(warnaIdList)]);
        
        const getSatuanQuery = 'SELECT id, nama FROM nd_satuan WHERE id IN(?)';
        const [satuanRows] = await pool.query(getSatuanQuery, [Array.from(satuanIdList)]);

        
        const daftarBarang = {};
        const daftarWarna = {};
        const daftarSatuan = {};


        for (const row of namaBarangRows) {
          console.log('row', row);
          daftarBarang[row.id] = row.nama;
        }

        for (const row of warnaJualRows) {
          daftarWarna[row.id] = row.nama_warna;
        }

        for (const row of satuanRows) {
          daftarSatuan[row.id] = row.nama;
        }
        

        /* const nama = namaBarangRows[0].nama;
        const warna_jual = warnaJualRows[0].nama_warna;
        const nama_satuan = satuanRows[0].nama; 
  
        const nama_jual = nama.toUpperCase()+' '+warna_jual.toUpperCase();
        const nama_barang = nama.toUpperCase()+' '+warna_jual.toUpperCase()+' '+nama_satuan.toUpperCase();*/

        
        await Promise.all(chunk.map(async (item) => {
          const { barang_id, warna_id, satuan_id } = item;
          console.log('barang_id', barang_id, daftarBarang[barang_id]);
          console.log('warna_id', warna_id, daftarWarna[warna_id]);
          console.log('satuan_id', satuan_id, daftarSatuan[satuan_id]);
          
          const nama = daftarBarang[barang_id].toUpperCase();
          const warna_jual = daftarWarna[warna_id].toUpperCase();
          const nama_satuan = daftarSatuan[satuan_id].toUpperCase();

          const nama_jual = nama+' '+warna_jual;
          const nama_barang = nama+' '+warna_jual+' '+nama_satuan;

          /* const barangIdStr = String(barang_id).padStart(4, '0');
          const warnaIdStr = String(warna_id).padStart(4, '0');
          const satuanIdStr = String(satuan_id).padStart(4, '0');
          const sixDigitIdentifier = barangIdStr + warnaIdStr + satuanIdStr;
          const sku_id = sixDigitIdentifier +'-'+ kode; */
          const kode = uuidv4();

          result.push({
            sku_id:kode,
            nama_barang:nama_barang,
            nama_jual:nama_jual,
            barang_id:barang_id,
            warna_id:warna_id,
            satuan_id:satuan_id,
            status_aktif:1
          }); 

        }));
      }

      return result;
    })
      
    /* addBarangSKUBulk: handleResolverError(async(_, {input}, context) => {
      const pool = context.pool;
      
      const newItems = [];
      const barangIdSet = new Set();
      const warnaIdSet = new Set();
      const satuanIdSet = new Set();
      const skuIdInserted = [];
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
        skuIdInserted.push(sku_id);
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
      
      const params = newItems.flatMap(item=>[item.sku_id, item.nama_barang, item.nama_jual, item.barang_id, item.warna_id, item.satuan_id, item.status_aktif]);
      
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

      
      const [resultInserted] = await pool.query(`SELECT * from nd_barang_sku WHERE sku_id IN (?)`, [skuIdInserted]);
      const insertedIds = resultInserted.map(item => item.id);
      await assignSelectedBarangSKUToko(insertedIds,pool);
      return resultInserted;
    }), */
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