const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

const pool = new Pool(poolConfig);

// === 🛑 TAMBAHKAN BLOK INI UNTUK MENANGKAP ERROR MENDADAK ===
pool.on('error', (err, client) => {
  console.error('Koneksi database Neon terputus secara mendadak:', err.message);
  // Aplikasi tidak akan crash, pool otomatis menangani pembuatan ulang koneksi
});
// ========================================================

pool
  .connect()
  .then(() => console.log('Database FoundLoka terhubung!'))
  .catch((err) => console.error('Gagal terhubung ke database:', err.message));

module.exports = pool;
