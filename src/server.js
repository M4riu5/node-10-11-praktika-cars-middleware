require('dotenv').config();
// susikuriam serveri
const express = require('express');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const morgan = require('morgan');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dbConfig = require('./config');

const app = express();

const PORT = process.env.PORT || 5000;
// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json())
// prisidedam morgan
// GET / - msg: server online
app.get('/', (req, res) => {
  res.json({ msg: 'Server Online' });
});
// Routes
// GET /api/articles/archive - grazina visus istrintus postus
app.get('/api/articles/archive', async (req,res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    let sql = 'Select * FROM posts WHERE archived = 1';
    const [rows] = await conn.query(sql);
    res.json(rows)
    conn.end()
  } catch (eror) {
    console.log('error', error)
    res.status(500).json({msg: 'something went wrong'})
  }
})
// GET /api/articles - grazina visus postus
app.get('/api/articles', async (req, res) => {
  // gauti query parametrus
  console.log('req.query ---->'.bgGreen, req.query);
  try {
    const conn = await mysql.createConnection(dbConfig);
    let sql = 'Select * FROM posts WHERE archived = 0';
    // if query params id
    if (req.query.id) {
      sql = 'Select * FROM posts WHERE id = ?';
    }
    // prideti order by kuris veikia nepriklausomai nuo kitu
    if (req.query.orderBy) {
      sql += ` ORDER BY ${conn.escapeId(req.query.orderBy)}`
    }

    // LIMIT
    if (req.query.limit) {
      sql += ` LIMIT ${conn.escape(+req.query.limit)}`;
    }

console.log('sql ---->', sql);
    const [rows] = await conn.execute(sql, [req.query.id || null]);
    
    res.status(200).json(rows)
    conn.end()
  } catch (error) {
    console.log('error', error);
    res.status(500).json({msg: 'something wen wrong'});
  }
});
// GET /api/articles/2 - grazina straipsni kurio id lygus 2 (dinaminis routes)
app.get('/api/articles/:aid', async (req, res) => {
  const id = req.params.aid;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const sql = 'Select * FROM posts WHERE id = ?';
    const [rows] = await conn.execute(sql, [id]);
    res.status(200).json(rows[0]);
    conn.end()
  } catch (error) {
    console.log('error', error);
    res.status(500).json({msg: 'something wen wrong'});
  }
});

// DELETE /api/articles/:aid
app.delete('/api/articles/:aid', async (req , res) => {
    const conn = await mysql.createConnection(dbConfig)
    // const sql = 'DELETE FROM posts WHERE id = ?'
    const sql = 'UPDATE posts SET archived = 1 WHERE id = ?';
    const [rows] = await conn.execute(sql, [req.params.aid])
    res.json(rows)
    conn.end()
  // res.json({msg : `Deleting article with id ${req.params.aid}`})
})
app.put('/api/articles/:aid', async (req,res) => {
  const {author , category, body} = req.body
  const conn = await mysql.createConnection(dbConfig)
  // const sql = 'DELETE FROM posts WHERE id = ?'
  const sql = 'UPDATE posts SET author = ?, category = ?, body = ? WHERE id = ?';
  const [rows] = await conn.execute(sql, [author , category, body ,req.params.aid])
  res.json(rows)
  conn.end()
})
// 404 - returns json
app.use((req, resp) => {
  resp.status(404).json({ msg: 'Page not found' });
});

async function testDbConnection() {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.query('SELECT 1');
    console.log('Connected to MYSQL db'.bgCyan.bold);
    conn.end()
  } catch (error) {
    console.log(`error connecting ot DB ${error.message}`.bgRed.bold);
    // console.log('error ---->', error);
    if (error.code === 'ECONNREFUSED') {
      console.log('is Xamp running ?'.yellow);
    }
  }
}

testDbConnection();

app.listen(PORT, () => console.log('Server is running'));
