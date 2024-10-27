const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '', 
  database: 'penitipan_motor',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
);

function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/login');
}

// halaman utama
app.get('/', (req, res) => {
  res.render('landing');
});

// login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) throw err;
    if (results.length && bcrypt.compareSync(password, results[0].password)) {
      req.session.userId = results[0].id;
      res.redirect('/dashboard');
    } else {
      res.redirect('/login');
    }
  });
});

// dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard');
});

// register
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
    if (err) throw err;
    res.redirect('/login');
  });
});

// pelanggan
app.get('/pelanggan', isAuthenticated, (req, res) => {
  db.query('SELECT * FROM pelanggan', (err, results) => {
    if (err) throw err;
    res.render('pelanggan', { data: results });
  });
});

app.post('/pelanggan', isAuthenticated, (req, res) => {
  const { name, contact } = req.body;
  db.query('INSERT INTO pelanggan (name, contact) VALUES (?, ?)', [name, contact], (err) => {
    if (err) throw err;
    res.redirect('/pelanggan');
  });
});

// kendaraan
app.get('/kendaraan', isAuthenticated, (req, res) => {
  db.query('SELECT * FROM kendaraan', (err, results) => {
    if (err) throw err;
    res.render('kendaraan', { data: results });
  });
});

app.post('/kendaraan', isAuthenticated, (req, res) => {
  const { plat, brand, color } = req.body;
  db.query('INSERT INTO kendaraan (plat, brand, color) VALUES (?, ?, ?)', [plat, brand, color], (err) => {
    if (err) throw err;
    res.redirect('/kendaraan');
  });
});

// transaksi
app.get('/transaksi', isAuthenticated, (req, res) => {
  db.query('SELECT * FROM transaksi', (err, results) => {
    if (err) throw err;
    res.render('transaksi', { data: results });
  });
});

app.post('/transaksi', isAuthenticated, (req, res) => {
  const { pelanggan_id, kendaraan_id, waktu_masuk, waktu_keluar } = req.body;
  db.query('INSERT INTO transaksi (pelanggan_id, kendaraan_id, waktu_masuk, waktu_keluar) VALUES (?, ?, ?, ?)', [pelanggan_id, kendaraan_id, waktu_masuk, waktu_keluar], (err) => {
    if (err) throw err;
    res.redirect('/transaksi');
  });
});

// pegawai
app.get('/pegawai', isAuthenticated, (req, res) => {
  db.query('SELECT * FROM pegawai', (err, results) => {
    if (err) throw err;
    res.render('pegawai', { data: results });
  });
});

app.post('/pegawai', isAuthenticated, (req, res) => {
  const { name, position, contact } = req.body;
  db.query('INSERT INTO pegawai (name, position, contact) VALUES (?, ?, ?)', [name, position, contact], (err) => {
    if (err) throw err;
    res.redirect('/pegawai');
  });
});

// logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// nenjalankan server
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
