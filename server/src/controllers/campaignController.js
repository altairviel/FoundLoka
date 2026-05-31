const pool = require('../config/db');

//post api/campaigns, owner membuat campaign baru, status defaultnya 'pending'
const createCampaign = async (req, res) => {
  const { title, description, category, target_amount, return_rate, tenor_months, lat, lng, address, deadline } = req.body;

  if (!title || !target_amount || !return_rate || !tenor_months || !lat || !lng) {
    return res.status(400).json({ message: 'Data wajib tidak lengkap' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO campaigns
        (owner_id, title, description, category, target_amount,
         return_rate, tenor_months, lat, lng, address, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [req.user.id, title, description, category, target_amount, return_rate, tenor_months, lat, lng, address, deadline || null],
    );

    res.status(201).json({
      message: 'Kampanye diajukan, menunggu persetujuan admin',
      campaign: result.rows[0],
    });
  } catch (err) {
    console.error('Create campaign error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = { createCampaign };
