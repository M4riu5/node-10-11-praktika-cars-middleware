const mysql = require('mysql2/promise');
const dbConfig = require('../config');

async function testDbConnection() {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.query('SELECT 1');
    console.log('Connected to MYSQL db'.bgCyan.bold);
    conn.end();
  } catch (error) {
    console.log(`error connecting ot DB ${error.message}`.bgRed.bold);
    // console.log('error ---->', error);
    if (error.code === 'ECONNREFUSED') {
      console.log('is Xamp running as administrator?'.yellow);
    }
  }
}
module.exports = {
  testDbConnection,
};
