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
            
            const query = `SELECT * FROM nd_barang`;
            const [rows] = await pool.query(query);
            return rows;
            
        }),
    },
    Mutation: {
        addBarang: handleResolverError(async (_, {input}, context) => {
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
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

            console.log('params', params);

            // const [result] = await pool.query(query, params);
            
            const result = await queryTransaction.insert(context, "nd_barang", query, params);

            if (nama_beli != '') {
                const queryBeli = `INSERT INTO nd_barang_beli (nama, barang_id, status_aktif ) VALUES (?, ?)`;
                const resultBeli = await queryTransaction.insert(context, "nd_barang_beli", queryBeli, [nama_beli, result.id, 1]);
                
            }
            
            return {id: result.id,
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
            }
        }),
        updateBarang: handleResolverError(async (_, {id, input}, context) => {
            
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

            // const [result] = await pool.query(query, params);

            const result = await queryTransaction.update(context, "nd_barang", id, query, params);

            if (nama_beli != '') {
                const checkBeli = `SELECT * FROM nd_barang_beli WHERE barang_id = ?`;
                const queryBeliCheck = await pool.query(checkBeli, [id]);
                const [rows] = queryBeliCheck;
                if (rows.length > 0) {
                    const queryBeli = `UPDATE nd_barang_beli SET nama = ? WHERE barang_id = ?`;
                    const resultBeli = await queryTransaction.update(context, "nd_barang_beli", id, queryBeli, [nama_beli, id]);
                } else {
                    const queryBeli = `INSERT INTO nd_barang_beli (nama, barang_id, status_aktif ) VALUES (?, ?)`;
                    const resultBeli = await queryTransaction.insert(context, "nd_barang_beli", queryBeli, [nama_beli, id, 1]);
                }                    
            } 

            return {id,
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
            };
        }),
    },
    Barang:{
        barangSKU: async(parent, args, context)=>{
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                console.log('parent', parent);
                const query = `SELECT * FROM nd_barang_sku WHERE barang_id = ?`;
                const [rows] = await pool.query(query, [parent.id]);
                return rows;
            } catch (error) {
                console.error(error);
                throw new Error("Internal Server Error Barang SKU");
            }
        },
        barangToko: async(parent, args, context)=>{
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                const query = `SELECT * FROM nd_toko_barang_assignment WHERE barang_id = ?`;
                const [rows] = await pool.query(query, [parent.id]);
                return rows;
            } catch (error) {
                console.error(error);
                throw new Error("Internal Server Error Barang TOKO");
            }
        },
    }
};

export default barangResolver;