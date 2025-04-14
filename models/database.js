require("dotenv").config();
const sql = require("mssql");

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: false, 
        enableArithAbort: true,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("Conectado a SQL Server");
        return pool;
    })
    .catch(err => {
        console.error("Error al conectar a SQL Server:", err);
        process.exit(1); // Cerrar la app si hay error
    });

module.exports = { sql, poolPromise };
