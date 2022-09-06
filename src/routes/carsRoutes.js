const express = require('express');
const mysql = require('mysql2/promise');
const dbConfig = require('../config');

const carRouter = express.Router();

// parsisiusti visus 2 automobilius

const columsArr = ['id', 'title', 'image', 'price', 'numberPlates'];
const selectedColumns = columsArr.join(', ');

// GET /api/cars
carRouter.get('/', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const sql = `SELECT ${selectedColumns} FROM cars WHERE deleted = 0`;
    // console.log('sql ===', sql);
    const [rows] = await conn.query(sql);
    res.status(200).json(rows);
    conn.end();
  } catch (error) {
    console.log('error ', error);
    res.status(500).json({
      msg: 'Something went wrong',
    });
  }
});

// GET /api/cars/5
carRouter.get('/:carId', async (req, res) => {
  const { carId } = req.params;
  console.log('carId ===', carId);
  console.log('typeof carId ===', typeof carId);
  // patikrinimas ar carId yra skaicius
  const idNum = Number(carId);
  if (Number.isNaN(idNum)) {
    res.status(400).json({ msg: 'car id shold be a number' });
    return;
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    const sql = `SELECT ${selectedColumns} FROM cars WHERE deleted = 0 AND id = ?`;
    console.log('sql ===', sql);
    const [rows] = await conn.execute(sql, [idNum]);
    // jei radom viena irasa
    if (rows.length === 1) {
      res.status(200).json(rows[0]);
    } else {
      // jei neradom
      res.status(404).json({ msg: 'not found' });
    }

    conn.end();
  } catch (error) {
    console.log('error ', error);
    res.status(500).json({
      msg: 'Something went wrong',
    });
  }
});

// 3. DELETE /api/cars/5 - istrina 1 auto pagal id arba 404
carRouter.delete('/:carId', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const sql = `
    UPDATE cars 
    SET deleted = true
    WHERE id = ?
    LIMIT 1
    `;
    const [rows] = await conn.execute(sql, [req.params.carId]);
    if (rows.changedRows === 1) {
      res.status(200).json({ msg: 'car deleted' });
    } else {
      res.status(400).json({ msg: 'nothing deleted' });
    }

    conn.end();
  } catch (error) {
    console.log('error ', error);
    res.status(500).json({
      msg: 'Something went wrong',
    });
  }
});

carRouter.post('/', async (req, res) => {
  console.log('req.body ===', req.body);
  const { title, image, price, numberPlates } = req.body;

  // VALIDATION
  if (
    [title.trim(), image.trim(), price.trim(), numberPlates.trim()].includes('')
  ) {
    res.status(400).json({
      type: 'validation',
      msg: 'Please check the form',
    });
    return;
  }
  // individuali valdacija
  const valdationErrors = [];
  // if (title.trim() === '') {
  //   valdationErrors.push({
  //     field: 'title',
  //     msg: 'cant be blank',
  //   });
  // }
  // if (title.trim() < 3) {
  //   valdationErrors.push({
  //     field: 'title',
  //     msg: 'Should be longer than 3',
  //   });
  // }
  // ar turim klaidu
  // if (valdationErrors.length > 0) {
  //   res.status(400).json({
  //     type: 'validation',
  //     errors: valdationErrors,
  //   });
  //   return;
  // }

  try {
    const conn = await mysql.createConnection(dbConfig);
    const sql = `
    INSERT INTO cars (title, image, price, numberPlates)
    VALUES (?,?,?,?)
    `;
    const [rows] = await conn.execute(sql, [title, image, price, numberPlates]);
    if (rows.affectedRows === 1) {
      res.status(201).json({ msg: 'car created' });
    } else {
      res.status(500).json({
        msg: 'Something went wrong',
      });
    }

    conn.end();
  } catch (error) {
    console.log('error ', error);
    res.status(500).json({
      msg: 'Something went wrong',
    });
  }
});

module.exports = carRouter;
