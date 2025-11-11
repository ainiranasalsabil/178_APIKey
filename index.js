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

app.post('/cekapi', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'API key tidak boleh kosong!' });
  }
  const sql = 'SELECT * FROM api_keys WHERE api_key = ? LIMIT 1';
  db.query(sql, [apiKey], (err, results) => {
    if (err) {
      console.error('❌ Error saat mencari API key:', err);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
    if (results.length > 0) {
      console.log(`✅ API Key valid: ${apiKey}`);
      res.json({ success: true, message: 'API key valid ✅' });
    } else {
      console.log(`❌ API Key tidak valid: ${apiKey}`);
      res.status(401).json({ success: false, message: 'API key tidak valid ❌' });
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
