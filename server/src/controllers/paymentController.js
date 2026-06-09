const { snap, coreApi } = require('../config/midtrans');
const pool = require('../config/db');
const crypto = require('crypto');

const createInvestmentPayment = async (req, res) => {
  const { campaign_id, amount } = req.body;
  const investor_id = req.user.id;

  if (!campaign_id || !amount) return res.status(400).json({ message: 'campaign_id dan amount wajib diisi' });
  if (parseFloat(amount) < 50000) return res.status(400).json({ message: 'Minimal investasi Rp 50.000' });

  try {
    // Cek kampanye aktif
    const campaignResult = await pool.query('SELECT * FROM campaigns WHERE id = $1 AND status = $2', [campaign_id, 'active']);
    if (campaignResult.rows.length === 0) return res.status(404).json({ message: 'Kampanye tidak ditemukan atau tidak aktif' });

    const campaign = campaignResult.rows[0];

    if (campaign.owner_id === investor_id) return res.status(400).json({ message: 'Tidak bisa investasi di kampanye sendiri' });

    const remaining = parseFloat(campaign.target_amount) - parseFloat(campaign.collected_amount);
    if (parseFloat(amount) > remaining)
      return res.status(400).json({
        message: `Melebihi sisa target. Maksimal: Rp ${remaining.toLocaleString('id-ID')}`,
      });

    // Ambil data investor
    const userResult = await pool.query('SELECT name, email, phone FROM users WHERE id = $1', [investor_id]);
    const user = userResult.rows[0];

    // Buat order ID unik
    const orderId = `INV-${Date.now()}-${investor_id.slice(0, 8)}`;

    // Buat transaksi Midtrans Snap
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(parseFloat(amount)),
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone || '',
      },
      item_details: [
        {
          id: campaign_id.slice(0, 8),
          price: Math.round(parseFloat(amount)),
          quantity: 1,
          name: `Investasi: ${campaign.title.slice(0, 50)}`,
        },
      ],
    });

    // Simpan ke tabel payment_transactions dengan status pending
    await pool.query(
      `INSERT INTO payment_transactions
       (id, user_id, campaign_id, amount, type, snap_token)
       VALUES ($1, $2, $3, $4, 'investment', $5)`,
      [orderId, investor_id, campaign_id, amount, transaction.token],
    );

    res.json({
      snap_token: transaction.token,
      order_id: orderId,
      redirect_url: transaction.redirect_url,
    });
  } catch (err) {
    console.error('Create investment payment error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
//POST /api/payments/installment, UMKM buat transaksi pembayaran cicilan
const createInstallmentPayment = async (req, res) => {
  const { installment_id } = req.body;

  try {
    //mengambil data cicilan dan pastikan milik owner yang sedang login
    const result = await pool.query(
      `
      SELECT ins.*, c.title, c.owner_id
      FROM installments ins
      JOIN campaigns c ON ins.campaign_id = c.id
      WHERE ins.id = $1
    `,
      [installment_id],
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Cicilan tidak ditemukan' });

    const ins = result.rows[0];

    if (ins.owner_id !== req.user.id) return res.status(403).json({ message: 'Cicilan ini bukan milik kampanyemu' });

    if (ins.status === 'paid') return res.status(400).json({ message: 'Cicilan ini sudah lunas' });

    //ambil data pemilik UMKM
    const userResult = await pool.query('SELECT name, email, phone FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    const orderId = `CIC-${Date.now()}-${installment_id.slice(0, 8)}`;

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(parseFloat(ins.amount)),
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone || '',
      },
      item_details: [
        {
          id: installment_id.slice(0, 8),
          price: Math.round(parseFloat(ins.amount)),
          quantity: 1,
          name: `Cicilan bulan ke-${ins.month_number}: ${ins.title.slice(0, 30)}`,
        },
      ],
    });

    //disimpan ke payment_transactions
    await pool.query(
      `INSERT INTO payment_transactions
       (id, user_id, campaign_id, amount, type, installment_id, snap_token)
       VALUES ($1, $2, $3, $4, 'installment', $5, $6)`,
      [orderId, req.user.id, ins.campaign_id, ins.amount, installment_id, transaction.token],
    );

    res.json({
      snap_token: transaction.token,
      order_id: orderId,
      redirect_url: transaction.redirect_url,
    });
  } catch (err) {
    console.error('Create installment payment error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Tambahkan fungsi ini di atas handleWebhook
const processInvestment = async (tx) => {
  try {
    // 1. Update jumlah yang terkumpul di tabel campaigns
    await pool.query(
      `UPDATE campaigns 
       SET collected_amount = collected_amount + $1 
       WHERE id = $2`,
      [tx.amount, tx.campaign_id],
    );

    // 2. Tambahkan record ke tabel investments
    // Pastikan tx.user_id berisi ID investor yang benar
    await pool.query(
      `INSERT INTO investments (id, investor_id, campaign_id, amount, created_at) 
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
      [tx.user_id, tx.campaign_id, tx.amount],
    );

    console.log(`✅ Investasi sebesar Rp ${tx.amount} sukses tercatat di tabel investments untuk campaign ${tx.campaign_id}`);
  } catch (err) {
    console.error('Error in processInvestment:', err.message);
    throw err;
  }
};

//helper, proses cicilan setelah pembayaran sukses
const processInstallment = async (tx) => {
  // Update status cicilan jadi paid
  const insResult = await pool.query(
    `UPDATE installments SET status = 'paid', paid_at = NOW()
     WHERE id = $1 RETURNING *`,
    [tx.installment_id],
  );
  const ins = insResult.rows[0];

  //ngecek apakah semua cicilan sudah lunas
  const remaining = await pool.query(
    `SELECT COUNT(*) FROM installments
     WHERE campaign_id = $1 AND status != 'paid'`,
    [tx.campaign_id],
  );

  if (parseInt(remaining.rows[0].count) === 0) {
    await pool.query(`UPDATE campaigns SET status = 'done' WHERE id = $1`, [tx.campaign_id]);
  }

  console.log(`Cicilan bulan ke-${ins.month_number} lunas untuk kampanye ${tx.campaign_id}`);
};

const handleWebhook = async (req, res) => {
  const notification = req.body;

  try {
    //verifikasi signature dari Midtrans agar tidak bisa dipalsukan
    const { order_id, status_code, gross_amount, signature_key } = notification;

    const expectedSignature = crypto.createHash('sha512').update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`).digest('hex');

    if (signature_key !== expectedSignature) {
      console.warn('⚠️  Webhook signature tidak valid!');
      return res.status(403).json({ message: 'Signature tidak valid' });
    }

    //cek status transaksi
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    //ambil data transaksi dari database
    const txResult = await pool.query('SELECT * FROM payment_transactions WHERE id = $1', [order_id]);
    if (txResult.rows.length === 0) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });

    const tx = txResult.rows[0];

    //pembayaran berhasil
    if (transactionStatus === 'settlement' || (transactionStatus === 'capture' && fraudStatus === 'accept')) {
      //update status transaksi
      await pool.query('UPDATE payment_transactions SET status = $1 WHERE id = $2', ['success', order_id]);

      if (tx.type === 'investment') {
        //proses investasi
        await processInvestment(tx);
      } else if (tx.type === 'installment') {
        //proses cicilan
        await processInstallment(tx);
      }

      //pembayaran gagal atau expired
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      await pool.query('UPDATE payment_transactions SET status = $1 WHERE id = $2', [transactionStatus, order_id]);
    }

    res.json({ message: 'Webhook diterima' });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const checkStatus = async (req, res) => {
  try {
    const status = await coreApi.transaction.status(req.params.orderId);
    res.json(status);
  } catch (err) {
    console.error('Check status error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
module.exports = { createInvestmentPayment, createInstallmentPayment, processInstallment, handleWebhook, checkStatus };
