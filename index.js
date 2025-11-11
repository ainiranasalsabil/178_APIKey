const express = require('express');
const crypto = require('crypto');
const path = require('path');
const mysql = require('mysql2');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'apikey_db',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Gagal terhubung ke database:', err);
  } else {
    console.log('✅ Koneksi ke MySQL berhasil!');
  }
});

function generateApiKey() {
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return `sk-sm-v1-${randomBytes}`;
}

app.post('/create', (req, res) => {
  const apiKey = generateApiKey();
  const sql = 'INSERT INTO api_keys (api_key) VALUES (?)';
  db.query(sql, [apiKey], (err, result) => {
    if (err) {
      console.error('❌ Gagal menyimpan API key ke database:', err);
      return res.status(500).json({ success: false, message: 'Gagal menyimpan API key ke database' });
    }
    console.log(`✅ API Key baru dibuat dan disimpan: ${apiKey}`);
    res.json({ success: true, apiKey });
  });
});

