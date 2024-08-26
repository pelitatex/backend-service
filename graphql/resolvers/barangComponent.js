const barangComponentResolver = {
    Query: {
        bahan: async(_,args, context)=>{
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                const query = `SELECT * FROM nd_bahan WHERE id = ?`;
                const [rows] = await pool.query(query, [args.id]);
                return rows[0];
            } catch (error) {
            console.error(error);
            throw new Error("Internal Server Error Bahan All");
            }
        },
        allBahan: async (_, args, context) => {
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                const query = `SELECT * FROM nd_bahan`;
                const [rows] = await pool.query(query);
                return rows;
            } catch (error) {
                console.error(error);
                throw new Error("Internal Server Error All Bahan");
            }
        },
        fitur: async (_, args, context) => {
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                const query = `SELECT * FROM nd_fitur WHERE id = ?`;
                const [rows] = await pool.query(query, [args.id]);
                return rows[0];
            } catch (error) {
                console.error(error);
                throw new Error("Internal Server Error Fitur");
            }
        },
        allFitur: async (_, args, context) => {
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                const query = `SELECT * FROM nd_fitur`;
                const [rows] = await pool.query(query);
                return rows;
            } catch (error) {
                console.error(error);
                throw new Error("Internal Server Error All Fitur");
            }
        },
        grade: async (_, args, context) => {
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                const query = `SELECT * FROM nd_grade WHERE id = ?`;
                const [rows] = await pool.query(query, [args.id]);
                return rows[0];
            } catch (error) {
                console.error(error);
                throw new Error("Internal Server Error Grade");
            }
        },
        allGrade: async (_, args, context) => {
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                const query = `SELECT * FROM nd_grade`;
                const [rows] = await pool.query(query);
                return rows;
            } catch (error) {
                console.error(error);
                throw new Error("Internal Server Error All Grade");
            }
        },
        tipe: async (_, args, context) => {
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                const query = `SELECT * FROM nd_tipe WHERE id = ?`;
                const [rows] = await pool.query(query, [args.id]);
                return rows[0];
            } catch (error) {
                console.error(error);
                throw new Error("Internal Server Error Tipe");
            }
        },
        allTipe: async (_, args, context) => {
            const pool = context.pool;
            if (!pool) {
                console.log('context', pool);
                throw new Error('Database pool not available in context.');
            }
            try {
                const query = `SELECT * FROM nd_tipe`;
                const [rows] = await pool.query(query);
                return rows;
            } catch (error) {
                console.error(error);
                throw new Error("Internal Server Error All Tipe");
            }
        },
    },
    Mutation: {
        addBahan: async (_, input, context) => {
            const result = await addBarangComponent(input, 'bahan', context);
            return result;
        },
        updateBahan: async (_, args, context) => {
            const result = await updateBarangComponent(args.input, args.id, 'bahan', context);
            return result;
        },
        addFitur: async (_, input, context) => {
            const result = await addBarangComponent(input, 'fitur', context);
            return result;
        },
        updateFitur: async (_, args, context) => {
            const result = await updateBarangComponent(args.input, args.id, 'fitur', context);
            return result;
        },
        addGrade: async (_, input, context) => {
            const result = await addBarangComponent(input, 'grade', context);
            return result;
        },
        updateGrade: async (_, args, context) => {
            const result = await updateBarangComponent(args.input, args.id, 'grade', context);
            return result;
        },
        addTipe: async (_, input, context) => {
            const result = await addBarangComponent(input, 'tipe', context);
            return result;
        },
        updateTipe: async (_, args, context) => {
            const result = await updateBarangComponent(args.input, args.id, 'tipe', context);
            return result;
        },
    }
}

const addBarangComponent = async ({input}, table, context) => {
    const pool = context.pool;
    if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
    }
    const { nama, keterangan } = input;
    if (nama.trim() === '') {
        throw new Error('Nama cannot be null or blank');
    }
    try {

        const checkExistQuery = `SELECT * FROM nd_${table} WHERE nama = ?`;
        const [existingRows] = await pool.query(checkExistQuery, [nama]);
        if (existingRows.length > 0) {
            throw new Error(`${table} with nama already exists.`);
        }

        const getLastInsertedKodeQuery = `SELECT kode FROM nd_${table} ORDER BY kode DESC LIMIT 1`;
        const [lastInsertedKodeRows] = await pool.query(getLastInsertedKodeQuery);
        let paddedKode = '00';
        if (lastInsertedKodeRows.length > 0) {
            const lastInsertedKode = lastInsertedKodeRows[0].kode;
            paddedKode = (parseInt(lastInsertedKode) + 1).toString().padStart(2, '0');
        }
        

        const query = `INSERT INTO nd_${table} (nama, kode, keterangan) VALUES (?, ?, ?)`;
        const [result] = await pool.query(query, [nama.toUpperCase(), paddedKode, keterangan]);
        return { id: result.insertId, nama: nama.toUpperCase(), kode:paddedKode, keterangan };
    } catch (error) {
        console.error(error);
        throw new Error(error.message || `Internal Server Error Add ${table}`);
    }
}

const updateBarangComponent = async (input, id, table, context) => {
    const pool = context.pool;
    if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
    }
    const {nama, keterangan} = input;
    if (nama.trim() === '') {
        throw new Error('Nama cannot be null or blank');
    }
    try {
        const checkExistQuery = `SELECT * FROM nd_${table} WHERE nama = ? AND id != ?`;
        const [existingRows] = await pool.query(checkExistQuery, [nama, id]);
        if (existingRows.length > 0) {
            throw new Error(`${table} with nama already exists.`);
        }

        const query = `UPDATE nd_${table} SET nama = ?, keterangan = ? WHERE id = ?`;
        const [result] = await pool.query(query, [nama.toUpperCase(), keterangan, id]);
        if (result.affectedRows === 0) {
            throw new Error(`${table} with id ${id} not found.`);
        }
        const getUpdatedDataQuery = `SELECT * FROM nd_${table} WHERE id = ?`;
        const [updatedRows] = await pool.query(getUpdatedDataQuery, [id]);
        return updatedRows[0];
    }catch (error) {
        console.error(error);
        throw new Error(`Internal Server Error Update ${table}`);
    }
}

export default barangComponentResolver;