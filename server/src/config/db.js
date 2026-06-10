const { Pool } = require('pg');

// Konfigurasi Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Menangani masalah SSL (menghilangkan warning & meningkatkan kompatibilitas)
  ssl: {
    rejectUnauthorized: false, // Railway/cloud biasanya pakai self-signed cert, ini bypass validasi sertifikatnya
  },
  // Konfigurasi ketahanan koneksi
  max: 20, // Maksimal koneksi
  idleTimeoutMillis: 30000, // Tutup koneksi idle setelah 30 detik
  connectionTimeoutMillis: 2000, // Gagal jika koneksi tidak terbuka dalam 2 detik
});

// PENTING: Tambahkan ini agar aplikasi tidak crash saat koneksi error
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Tes koneksi saat aplikasi mulai
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log(' Database FoundLoka terhubung!');
  }
});

module.exports = pool;
