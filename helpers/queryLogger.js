const queryLogger = async (pool, table, affected_id, query, params) => {

    try {
        const queryLog = `INSERT INTO query_log (table_name, affected_id, query, params) VALUES (?, ?, ?, ?)`;
        const [result] = await pool.query(queryLog, [table, affected_id, query, JSON.stringify(params)]);
        return result;  
    } catch (error) {
        console.error(error.message || "Error on query logging");
    }
}

export default queryLogger;