const express = require('express');
const mysql = require('mysql2'); // Import mysql2 module

// Create a MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'Chintu@123',
  database: 'example_db'
});

// Create Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Start the Express server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Define a route handler for the root endpoint
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Routes

// GET all projects for a given ticker
app.get('/api/ticker=:ticker', (req, res) => {
  const ticker = req.params.ticker;
  pool.query(`SELECT * FROM project WHERE ticker='${ticker}'`, (err, results) => {
    if (err) {
      console.error(`Error fetching data for ticker ${ticker}:`, err);
      res.status(500);
      res.send(`Error fetching data for ticker ${ticker}`);
      return;
    }
    res.json(results);
  });
});

// Routes

// GET data for a given ticker with specific columns
app.get('/api/ticker/:ticker/columns/:columns', (req, res) => {
  const { ticker, columns } = req.params;
  const columnNames = columns.split(',');
  const columnQuery = columnNames.map(column => `\`${column}\``).join(',');
  pool.query(`SELECT ${columnQuery} FROM project WHERE ticker='${ticker}'`, (err, results) => {
    if (err) {
      console.error(`Error fetching data for ticker ${ticker} with columns ${columns}:`, err);
      res.status(500);
      res.send(`Error fetching data for ticker ${ticker} with columns ${columns}`);
      return;
    }
    res.json(results);
  });
});


// GET data for a given ticker with specific columns and period
app.get('/api/ticker/:ticker/columns/:columns/period/:period', (req, res) => {
  const { ticker, columns, period } = req.params;
  const columnNames = columns.split(',');
  const columnQuery = columnNames.map(column => `\`${column}\``).join(',');
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - parseInt(period));
  const formattedStartDate = startDate.toISOString().split('T')[0];
  pool.query(`SELECT ${columnQuery} FROM project WHERE ticker='${ticker}' AND date >= '${formattedStartDate}'`, (err, results) => {
    if (err) {
      console.error(`Error fetching data for ticker ${ticker} with columns ${columns} for the last ${period} years:`, err);
      res.status(500);
      res.send(`Error fetching data for ticker ${ticker} with columns ${columns} for the last ${period} years`);
      return;
    }
    res.json(results);
  });
});
