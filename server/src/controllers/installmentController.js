const pool = require('../config/db');

//GET api/installments/campaign/:id, daftar semua cicilan 1 kampanye sama ringkasan statusnya
const getCampaignInstallments = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT ins.*,
        c.title        AS campaign_title,
        c.target_amount, c.return_rate,
        c.tenor_months, c.owner_id
      FROM installments ins
      JOIN campaigns c ON ins.campaign_id = c.id
      WHERE ins.campaign_id = $1
      ORDER BY ins.month_number ASC
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Belum ada jadwal cicilan untuk kampanye ini' });
    }

    const installments = result.rows;
    const summary = {
      total: installments.length,
      paid: installments.filter((i) => i.status === 'paid').length,
      late: installments.filter((i) => i.status === 'late').length,
      pending: installments.filter((i) => i.status === 'pending').length,
    };

    res.json({ installments, summary });
  } catch (err) {
    console.error('Get installments error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

//GET api/installments/my, untuk dapat semua ciiclan dari semua kampanye milik owner yang sedang login
const getMyInstallments = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT ins.*, c.title AS campaign_title,
        c.target_amount, c.return_rate
      FROM installments ins
      JOIN campaigns c ON ins.campaign_id = c.id
      WHERE c.owner_id = $1
      ORDER BY ins.due_date ASC
    `,
      [req.user.id],
    );

    res.json({ installments: result.rows });
  } catch (err) {
    console.error('Get my installments error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

//PUT api/installments/:id/pay
const payInstallment = async (req, res) => {
  const { id } = req.params;

  try {
    // Ambil data cicilan + pastikan milik owner yang login
    const result = await pool.query(
      `
      SELECT ins.*, c.owner_id, c.title AS campaign_title
      FROM installments ins
      JOIN campaigns c ON ins.campaign_id = c.id
      WHERE ins.id = $1
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cicilan tidak ditemukan' });
    }

    const ins = result.rows[0];

    //hanya pemilik kampanye yang bisa bayar cicilan
    if (ins.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Cicilan ini bukan milik kampanyemu' });
    }

    //kalau sudah lunas, tidak bisa bayar lagi
    if (ins.status === 'paid') {
      return res.status(400).json({ message: 'Cicilan ini sudah lunas' });
    }

    //tandai cicilan sebagai lunas
    await pool.query('UPDATE installments SET status = $1, paid_at = NOW() WHERE id = $2', ['paid', id]);

    //ngecek apakah semua cicilan kampanye ini sudah lunas
    const remaining = await pool.query(
      `SELECT COUNT(*) FROM installments
       WHERE campaign_id = $1 AND status != 'paid'`,
      [ins.campaign_id],
    );

    //kalau semua lunas, maka kampanye selesai
    if (parseInt(remaining.rows[0].count) === 0) {
      await pool.query("UPDATE campaigns SET status = 'done' WHERE id = $1", [ins.campaign_id]);
      return res.json({
        message: `Cicilan bulan ke-${ins.month_number} lunas! 🎉 Semua cicilan selesai — kampanye berstatus DONE`,
        campaign_done: true,
      });
    }

    res.json({
      message: `Cicilan bulan ke-${ins.month_number} berhasil ditandai lunas`,
      campaign_done: false,
    });
  } catch (err) {
    console.error('Pay installment error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = { getCampaignInstallments, getMyInstallments, payInstallment };
