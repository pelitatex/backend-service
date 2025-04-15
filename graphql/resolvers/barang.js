// import queryLogger from "../../helpers/queryLogger.js";
import { queryLogger, queryTransaction }  from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const barangResolver = {
    Query: {
        barang: handleResolverError(async(_,args, context)=>{
            const pool = context.pool;
            
            const query = `SELECT * FROM nd_barang WHERE id = ?`;
            const [rows] = await pool.query(query, [args.id]);
            return rows[0];
            
        }),
        allBarang: handleResolverError(async (_, args, context) => {
            
            const pool = context.pool;
            const query = `SELECT * FROM nd_barang`;
            const [rows] = await pool.query(query);
            return rows;
            
        }),
    },
    Mutation: {
        addBarang: handleResolverError(async (_, {input}, context) => {
            const pool = context.pool;
            const {
                sku_id,
                nama_jual,
                nama_beli,
                satuan_id,
                jenis_barang,
                grade,
                bahan,
                tipe,
                fitur,
                qty_warning,
                deskripsi_info,
                status_aktif

            } = input;
            

            const query = `INSERT INTO nd_barang (sku_id, nama_jual, satuan_id, jenis_barang, grade, bahan, tipe, fitur, qty_warning, deskripsi_info, status_aktif) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const params = [
                sku_id,
                nama_jual,
                satuan_id,
                jenis_barang,
                grade,
                bahan,
                tipe,
                fitur,
                qty_warning,
                deskripsi_info,
                status_aktif
            ];

            
            // const result = await queryTransaction.insert(context, "nd_barang", query, params);

            let insertId = null;

            try {
                pool.query("START TRANSACTION");
                const [result] = await pool.query(query, params);
                if (result.affectedRows == 0) {
                    throw new Error('Gagal Insert Barang');
                }
                insertId = result.insertId;
    
                if (nama_beli != '') {
                    const queryBeli = `INSERT INTO nd_barang_beli (nama, barang_id, status_aktif ) VALUES (?, ?)`;
                    const [resultBeli] = await pool.query(queryBeli, [nama_beli, result.id, 1]);
                    if(resultBeli.affectedRows == 0){
                        throw new Error('Gagal Insert Barang Beli');
                    }
                }

                pool.query("COMMIT");

            } catch (error) {
                pool.query("ROLLBACK");
                throw error;
            }


            queryLogger(pool, `nd_barang`, insertId, query, params);
            
            return {id: insertId,
                sku_id,
                nama_jual,
                nama_beli,
                satuan_id,
                jenis_barang,
                grade,
                bahan,
                tipe,
                fitur,
                qty_warning,
                deskripsi_info,
                status_aktif
            }
        }),
        updateBarang: handleResolverError(async (_, {id, input}, context) => {
            const pool = context.pool;
            
            const {
                sku_id, nama_jual, 
                nama_beli,
                satuan_id, jenis_barang,
                grade, bahan, tipe, fitur,
                qty_warning, deskripsi_info, status_aktif
            } = input;

            const query = `UPDATE nd_barang 
                           SET sku_id = ?, nama_jual = ?, satuan_id = ?, jenis_barang = ?, 
                           grade = ?, bahan = ?, tipe = ?, fitur = ?, 
                           qty_warning = ?, deskripsi_info = ?, status_aktif = ? 
                           WHERE id = ?`;
            
            const params = [
                sku_id, nama_jual, satuan_id, jenis_barang, 
                grade, bahan, tipe, fitur, 
                qty_warning, deskripsi_info, status_aktif, 
                id
            ];

            // const result = await queryTransaction.update(context, "nd_barang", id, query, params);

            try {
                pool.query("START TRANSACTION");
                const [result] = await pool.query(query, params);
                if (result.affectedRows == 0) {
                    throw new Error('Gagal Update Barang');
                }
                pool.query("COMMIT");
                await queryLogger(pool, `nd_barang`, id, query, params);
            } catch (error) {
                pool.query("ROLLBACK");
                throw error;
            }

            return {id,
                sku_id,
                nama_jual,
                nama_beli:nama_beli,
                satuan_id,
                jenis_barang,
                grade,
                bahan,
                tipe,
                fitur,
                qty_warning,
                deskripsi_info,
                status_aktif
            };
        }),
    },
    Barang:{
        barangSKU: handleResolverError(async(parent, args, context)=>{
            
            console.log('parent', parent);
            const query = `SELECT * FROM nd_barang_sku WHERE barang_id = ?`;
            const [rows] = await pool.query(query, [parent.id]);
            return rows;
            
        }),
        barangToko: handleResolverError(async(parent, args, context)=>{
            
            const query = `SELECT * FROM nd_toko_barang_assignment WHERE barang_id = ?`;
            const [rows] = await pool.query(query, [parent.id]);
            return rows;
            
        }),
    }
};

export default barangResolver;