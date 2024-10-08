import queryLogger from "../../helpers/queryLogger.js";

const barangResolver = {
    Query: {
        barang: async(_,args, context)=>{
        const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                const query = `SELECT * FROM nd_barang WHERE id = ?`;
                const [rows] = await pool.query(query, [args.id]);
                return rows[0];
            } catch (error) {
            console.error(error);
            throw new Error("Internal Server Error Barang All");
            }
        },
        allBarang: async (_, args, context) => {
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                const query = `SELECT * FROM nd_barang`;
                const [rows] = await pool.query(query);
                return rows;
            } catch (error) {
                console.error(error);
                throw new Error("Internal Server Error All Barang");
            }
        },
    },
    Mutation: {
        addBarang: async (_, {input}, context) => {
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                const {
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

                } = input;
                const query = `INSERT INTO nd_barang (sku_id, nama_jual, satuan_id, jenis_barang, grade, bahan, tipe, fitur, qty_warning, deskripsi_info, status_aktif) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const [result] = await pool.query(query, [
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
                ]);

                queryLogger(pool, 'nd_barang' ,query, [sku_id,
                    nama_jual,
                    satuan_id,
                    jenis_barang,
                    grade,
                    bahan,
                    tipe,
                    fitur,
                    qty_warning,
                    deskripsi_info,
                    status_aktif]);
                return {id: result.insertId,
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
            } catch (error) {
                console.error(error);
                throw new Error("Internal Server Error Add Barang");
            }
        },
        updateBarang: async (_, {id, input}, context) => {
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {

                const {
                    sku_id, nama_jual, satuan_id, jenis_barang,
                    grade, bahan, tipe, fitur,
                    qty_warning, deskripsi_info, status_aktif
                } = input;

                const query = `UPDATE nd_barang 
                               SET sku_id = ?, nama_jual = ?, satuan_id = ?, jenis_barang = ?, 
                               grade = ?, bahan = ?, tipe = ?, fitur = ?, 
                               qty_warning = ?, deskripsi_info = ?, status_aktif = ? 
                               WHERE id = ?`;
                
                const [result] = await pool.query(query, [
                    sku_id, nama_jual, satuan_id, jenis_barang, 
                    grade, bahan, tipe, fitur, 
                    qty_warning, deskripsi_info, status_aktif, 
                    id
                ]);

                if (result.affectedRows === 0) {
                    throw new Error(`Satuan with id ${id} not found.`);
                }

                queryLogger(pool, 'nd_barang' ,query, [sku_id,
                    nama_jual,
                    satuan_id,
                    jenis_barang,
                    grade,
                    bahan,
                    tipe,
                    fitur,
                    qty_warning,
                    deskripsi_info,
                    status_aktif, id]);

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
            } catch (error) {
                console.error(error);
                throw new Error("Internal Server Error Update Barang");
            }
        },
    },
};

export default barangResolver;