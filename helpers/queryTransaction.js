const queryLogger = async (pool, table, affected_id, query, params) => {

    try {
        const queryLog = `INSERT INTO query_log (table_name, affected_id, query, params) VALUES (?, ?, ?, ?)`;
        const [result] = await pool.query(queryLog, [table, affected_id, query, JSON.stringify(params)]);
        return result;  
    } catch (error) {
        console.error(error.message || "Error on query logging");
    }
}

const queryTransaction = {
    insert: async (pool, table, query, params) => {
        console.log(params);
        try {
            await pool.query('START TRANSACTION');
            const [result] = await pool.query(query, params);
            await queryLogger(pool, table, result.insertId, query, params);
            await pool.query('COMMIT');
            const [insertedCustomer] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);
            return insertedCustomer[0];
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error(error.message || "Error during insertion");
        }
    },
    update: async (pool, table, affected_id, query, params) => {
        // console.log('paramsId', affected_id);
        try {
            await pool.query('START TRANSACTION');
            const [result] = await pool.query(query, params);
            await queryLogger(pool, table, affected_id, query, params);
            await pool.query('COMMIT');
            if (result.affectedRows === 0) {
                throw new Error("Data not found");
            }
            
            const [updatedCustomer] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [affected_id]);
            return updatedCustomer[0];
            
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error(error.message || "Error during update");
        }
    },
    delete: async (pool, table, query, params) => {
        try {
            await pool.query('START TRANSACTION');
            const [result] = await pool.query(query, params);
            queryLogger(pool, table, params[params.id], query, params);
            await pool.query('COMMIT');
            return result;
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error(error.message || "Error during delete");
        }
    }
}

export default queryTransaction;