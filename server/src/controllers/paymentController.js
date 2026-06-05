const { snap, coreApi } = require('../config/midtrans');
const pool = require('../config/db');
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

module.exports = { createInvestmentPayment, createInstallmentPayment };
