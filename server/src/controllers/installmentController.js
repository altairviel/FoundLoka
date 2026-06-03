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

module.exports = { getCampaignInstallments, getMyInstallments };
