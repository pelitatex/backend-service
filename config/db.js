import mysql from 'mysql2';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hameyean',
    port: 3306
});

db.connect((err) => {
    if(err) {
        console.error("Error connecting to MYSQL: "+err);
        throw err;
    }
    console.log("Connected to MySQL database");

})

export default db;