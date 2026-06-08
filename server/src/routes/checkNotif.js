// server/checkNotif.js
// Jalankan sekali dari terminal: node checkNotif.js
// Untuk debug apakah tabel notifications ada dan isinya apa

require('dotenv').config();

// 💡 Ambil instansiasi pool yang sudah ada di config/db.js kamu (sesuaikan relative path-nya)
const pool = require('../config/db');

async function check() {
  try {
    // 1. Cek apakah tabel ada
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'notifications'
      )
    `);
    console.log('Tabel notifications ada:', tableCheck.rows[0].exists);
    if (!tableCheck.rows[0].exists) {
      console.log('\n❌ TABEL TIDAK ADA. Jalankan create_notifications_table.sql di database kamu.');
      process.exit(1);
    }

    // 2. Cek kolom tabel
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notifications'
    `);
    console.log('\nKolom tabel notifications:');
    cols.rows.forEach((r) => console.log(' -', r.column_name, ':', r.data_type));

    // 3. Cek isi tabel
    const data = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5');
    console.log('\nIsi tabel (5 terbaru):', data.rows.length, 'baris');
    data.rows.forEach((r) => console.log(' -', r.id, '|', r.user_id, '|', r.message?.slice(0, 50), '|', r.is_read));

    // 4. Cek user_id yang ada di tabel
    const users = await pool.query('SELECT DISTINCT user_id FROM notifications');
    console.log(
      '\nUser ID yang punya notifikasi:',
      users.rows.map((r) => r.user_id),
    );
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
