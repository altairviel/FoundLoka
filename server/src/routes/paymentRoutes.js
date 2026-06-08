const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createInvestmentPayment, createInstallmentPayment, handleWebhook, checkStatus } = require('../controllers/paymentController');

// Impor koneksi pool PostgreSQL kamu (sesuaikan path jika berbeda)
const pool = require('../config/db');

// ── RUTE UTAMA APLIKASI ───────────────────────────────────────────────────
router.post('/invest', protect, createInvestmentPayment);
router.post('/installment', protect, createInstallmentPayment);
router.post('/webhook', handleWebhook);
router.get('/status/:orderId', protect, checkStatus);

// ── RUTE BYPASS DEMO LOKAL (POSTGRESQL) ───────────────────────────────────
/**
 * Jalur pintas untuk memaksa database lokal memperbarui status secara instan
 * saat simulasi pembayaran sukses di sandbox Midtrans (tanpa nunggu webhook internet).
 */
if (process.env.NODE_ENV !== 'production') {
  router.post('/demo-success', protect, async (req, res) => {
    const { order_id } = req.body;
    console.log('=== MEMULAI BYPASS DEMO POSTGRESQL UNTUK ORDER ID:', order_id);

    try {
      // 1. Ambil data transaksi dari tabel payment_transactions menggunakan placeholder $1
      const txResult = await pool.query('SELECT * FROM payment_transactions WHERE id = $1', [order_id]);
      const rows = txResult.rows;

      if (!rows || rows.length === 0) {
        console.log('❌ ERROR: Order ID tidak ditemukan di tabel payment_transactions!');
        return res.status(404).json({ message: 'Transaksi tidak ditemukan di database.' });
      }

      const tx = rows[0];
      console.log('🔍 Transaksi Ditemukan. Status saat ini:', tx.status);

      // 2. Jika status transaksi di database lokal masih pending, kita eksekusi pembaruan
      if (tx.status === 'pending') {
        // A. Update status transaksi utama menjadi 'success'
        await pool.query('UPDATE payment_transactions SET status = $1 WHERE id = $2', ['success', order_id]);
        console.log("✅ Status di payment_transactions berhasil diubah menjadi 'success'");

        // B. Jalankan logika spesifik berdasarkan tipe transaksi
        if (tx.type === 'investment') {
          // B1. Update dana yang terkumpul di tabel campaigns
          await pool.query('UPDATE campaigns SET collected_amount = collected_amount + $1 WHERE id = $2', [tx.amount, tx.campaign_id]);
          console.log(`✅ Saldo Campaign ID ${tx.campaign_id} berhasil ditambah sebesar ${tx.amount}`);

          // 🔥 B2. CEK & OTOMATISASI STATUS CAMPAIGN JIKA SUDAH PENUH
          const campaignCheck = await pool.query('SELECT collected_amount, target_amount FROM campaigns WHERE id = $1', [tx.campaign_id]);

          if (campaignCheck.rows.length > 0) {
            const campaign = campaignCheck.rows[0];

            // Konversi ke Float untuk memastikan perbandingan matematika akurat
            const currentAmount = parseFloat(campaign.collected_amount);
            const targetAmount = parseFloat(campaign.target_amount);

            if (currentAmount >= targetAmount) {
              // Paksa ganti status jadi 'funded' agar hilang dari pencarian 'active'
              await pool.query("UPDATE campaigns SET status = 'funded' WHERE id = $1", [tx.campaign_id]);
              console.log(`🎉 STATUS CAMPAIGN ID ${tx.campaign_id} BERHASIL DIUBAH MENJADI 'funded'`);
            }
          }

          // B3. INSERT data baru ke tabel investments agar muncul di dashboard investor
          const currentInvestorId = tx.investor_id || tx.user_id;

          await pool.query(
            `INSERT INTO investments (id, investor_id, campaign_id, amount, created_at) 
             VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
            [currentInvestorId, tx.campaign_id, tx.amount],
          );
          console.log(`✅ Portofolio investasi berhasil dicatat untuk Investor ID: ${currentInvestorId}`);
        } else if (tx.type === 'installment') {
          // Logika jika yang dibayar adalah cicilan bulanan owner UMKM
          await pool.query('UPDATE installments SET status = $1 WHERE id = $2', ['paid', tx.installment_id]);
          console.log(`✅ Status cicilan ID ${tx.installment_id} berhasil diubah menjadi 'paid'`);
        }
      } else {
        console.log('ℹ️ Transaksi dilewati karena statusnya sudah tidak pending (sudah success/expired).');
      }

      return res.status(200).json({
        success: true,
        message: 'Seluruh dashboard dan data campaign berhasil diperbarui!',
      });
    } catch (err) {
      console.error('❌ TERJADI SQL ERROR DI BACKEND POSTGRESQL:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui data demo.',
        error: err.message,
      });
    }
  });
}

module.exports = router;
