export const queryLogger = async (pool, table, affected_id, query, params, username) => {

    try {
        const queryLog = `INSERT INTO query_log (table_name, affected_id, query, params, username) VALUES (?, ?, ?, ?, ?)`;

        let stringifiedParams;
        try {
            stringifiedParams = JSON.stringify(params);
        } catch (stringifyError) {
            console.error("Failed to stringify params:", stringifyError.message || stringifyError);
            stringifiedParams = null; 
        }

        const [result] = await pool.query(queryLog, [table, affected_id, query, stringifiedParams, username]);
        return result;
    } catch (error) {
        console.error(error.message || "Error on query logging");
    }
}

export const queryTransaction = {
    insert: async (context, table, query, params) => {
        const pool = context.pool;
        const username = context.username;
        
        try {
            await pool.query('START TRANSACTION');
            const [result] = await pool.query(query, params);
            await queryLogger(pool, table, result.insertId, query, params, username);
            await pool.query('COMMIT');
            const [insertedCustomer] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);
            return insertedCustomer[0];
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error(error.message || "Error during insertion");
        }
    },
    update: async (context, table, affected_id, query, params) => {
        // console.log('paramsId', affected_id);
        const pool = context.pool;
        const username = context.username;
        try {
            await pool.query('START TRANSACTION');
            const [result] = await pool.query(query, params);
            await queryLogger(pool, table, affected_id, query, params, username);
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
    delete: async (context, table, query, params) => {
        const pool = context.pool;
        const username = context.username;
        try {
            await pool.query('START TRANSACTION');
            const [result] = await pool.query(query, params);
            queryLogger(pool, table, params[params.id], query, params, username);
            await pool.query('COMMIT');
            return result;
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error(error.message || "Error during delete");
        }
    }
}