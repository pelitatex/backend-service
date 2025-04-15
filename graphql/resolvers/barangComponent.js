// import queryLogger from "../../helpers/queryTransaction.js";
import { queryLogger, queryTransaction } from "../../helpers/queryTransaction.js";
import handleResolverError from "../handleResolverError.js";

const barangComponentResolver = {
    Query: {
        bahan: handleResolverError(async(_,args, context)=>{
            const result =await getBarangComponent(args, 'bahan', context);
            return result;
        }),
        allBahan: handleResolverError(async (_, args, context) => {
            const result =await getAllBarangComponent('bahan',context);
            return result;
        }),
        fitur: handleResolverError(async (_, args, context) => {
            const result =await getBarangComponent(args, 'fitur', context);
            return result;
        }),
        allFitur: handleResolverError(async (_, args, context) => {
            const result =await getAllBarangComponent('fitur',context);
            return result;
        }),
        grade: handleResolverError(async (_, args, context) => {
            const result =await getBarangComponent(args, 'grade', context);
            return result;
        }),
        allGrade: handleResolverError(async (_, args, context) => {
            const result =await getAllBarangComponent('grade',context);
            return result;
        }),
        tipe: handleResolverError(async (_, args, context) => {
            const result =await getBarangComponent(args, 'tipe', context);
            return result;
        }),
        allTipe: handleResolverError(async (_, args, context) => {
            const result =await getAllBarangComponent('tipe',context);
            return result;
        }),
    },
    Mutation: {
        addBahan: handleResolverError(async (_, input, context) => {
            const result = await addBarangComponent(input, 'bahan', context);
            return result;
        }),
        updateBahan: handleResolverError(async (_, args, context) => {
            const result = await updateBarangComponent(args.input, args.id, 'bahan', context);
            return result;
        }),
        addFitur: handleResolverError(async (_, input, context) => {
            const result = await addBarangComponent(input, 'fitur', context);
            return result;
        }),
        updateFitur: handleResolverError(async (_, args, context) => {
            const result = await updateBarangComponent(args.input, args.id, 'fitur', context);
            return result;
        }),
        addGrade: handleResolverError(async (_, input, context) => {
            const result = await addBarangComponent(input, 'grade', context);
            return result;
        }),
        updateGrade: handleResolverError(async (_, args, context) => {
            const result = await updateBarangComponent(args.input, args.id, 'grade', context);
            return result;
        }),
        addTipe: handleResolverError(async (_, input, context) => {
            const result = await addBarangComponent(input, 'tipe', context);
            return result;
        }),
        updateTipe: handleResolverError(async (_, args, context) => {
            const result = await updateBarangComponent(args.input, args.id, 'tipe', context);
            return result;
        }),
    }
}

const getBarangComponent = async (args, table, context) => {
    const pool = context.pool;
    if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
    }
    try {
        const query = `SELECT * FROM nd_barang_${table} WHERE id = ?`;
        const [rows] = await pool.query(query, [args.id]);
        return rows[0];
    } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error "+table);
    }
}

const getAllBarangComponent = async (table, context) => {
    const pool = context.pool;
    if (!pool) {
        console.log('context', pool);
        throw new Error('Database pool not available in context.');
    }
    try {
        const query = `SELECT * FROM nd_barang_${table}`;
        const [rows] = await pool.query(query);
        console.log('result',rows);
        return rows;
    } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error All "+table);
    }
}

const addBarangComponent = async ({input}, table, context) => {

    const pool = context.pool;
    const { nama, keterangan } = input;
    if (nama.trim() === '') {
        throw new Error('Nama cannot be null or blank');
    }

    const getLastInsertedKodeQuery = `SELECT kode FROM nd_barang_${table} ORDER BY kode DESC LIMIT 1`;
    const [lastInsertedKodeRows] = await pool.query(getLastInsertedKodeQuery);
    let paddedKode = '00';
    if (lastInsertedKodeRows.length > 0) {
        const lastInsertedKode = lastInsertedKodeRows[0].kode;
        paddedKode = (parseInt(lastInsertedKode) + 1).toString().padStart(2, '0');
    } 

    let insertId = 0;
    try {
        pool.query("START TRANSACTION");
        // const result = await queryTransaction.insert(context, `nd_barang_${table}`, query, [nama.toUpperCase(), paddedKode, keterangan]);
        const query = `INSERT INTO nd_barang_${table} (nama, kode, keterangan) VALUES (?, ?, ?)`;
        const [result] = await pool.query(query, [nama.toUpperCase(), paddedKode, keterangan]);
        if(result.affectedRows === 0) {
            throw new Error('Insert failed');
        }
        insertId = result.insertId;
        pool.query("COMMIT");
        queryLogger(pool, `nd_barang_${table}`, insertId ,query, [nama.toUpperCase(), paddedKode, keterangan]);
        
    } catch (error) {
        pool.query("ROLLBACK");
        console.error(error);
    }
    

    return { id: insertId, nama: nama.toUpperCase(), kode:paddedKode, keterangan };
}

const updateBarangComponent = async (input, id, table, context) => {
    
    const pool = context.pool;
    const {nama, keterangan} = input;
    if (nama.trim() === '') {
        throw new Error('Nama cannot be null or blank');
    }
    
    // const result = await queryTransaction.update(context, `nd_barang_${table}`, id, query, [nama.toUpperCase(), keterangan, id]);
    
    let result;
    try {
        pool.query("START TRANSACTION");
        const query = `UPDATE nd_barang_${table} SET nama = ?, keterangan = ? WHERE id = ?`;
        [result] = await pool.query(query, [nama.toUpperCase(), keterangan, id]);
        if (result.affectedRows === 0) {
            throw new Error(`${table} with id ${id} not found.`);
        }
        pool.query("COMMIT");
        await queryLogger(pool, `nd_barang_${table}`,'id', query, [nama.toUpperCase(), keterangan, id]);
    } catch (error) {
        pool.query("ROLLBACK");
        console.error(error);
    }

    return result;
    
    
}

export default barangComponentResolver;