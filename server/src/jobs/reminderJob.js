const cron = require('node-cron');
const pool = require('../config/db');

//ngecek cicilan terlambat
cron.schedule('1 0 * * *', async () => {
  console.log('⏰ Cron: Mengecek cicilan yang terlambat...');

  try {
    const result = await pool.query(`
      UPDATE installments
      SET status = 'late'
      WHERE status = 'pending'
        AND due_date < CURRENT_DATE
      RETURNING id, campaign_id, month_number, due_date
    `);

    if (result.rows.length > 0) {
      console.log(`⚠️  ${result.rows.length} cicilan ditandai terlambat`);
    } else {
      console.log('Tidak ada cicilan terlambat hari ini');
    }
  } catch (err) {
    console.error('Cron error:', err.message);
  }
});

console.log('Reminder job aktif, cek cicilan terlambat tiap hari jam 00.01');
