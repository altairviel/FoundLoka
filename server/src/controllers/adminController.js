const pool = require('../config/db');

// GET /api/admin/stats, untuk melihat statistik platform
const getStats = async (req, res) => {
  try {
    const [users, campaigns, investments] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT status, COUNT(*) FROM campaigns GROUP BY status'),
      pool.query('SELECT COUNT(*), COALESCE(SUM(amount),0) AS total FROM investments'),
    ]);

    const campaignStats = {};
    campaigns.rows.forEach((r) => {
      campaignStats[r.status] = parseInt(r.count);
    });

    res.json({
      total_users: parseInt(users.rows[0].count),
      campaigns: campaignStats,
      total_invested: parseFloat(investments.rows[0].total),
      total_investors: parseInt(investments.rows[0].count),
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

/* GET /api/admin/campaigns?status=pending */
const getAllCampaigns = async (req, res) => {
  const { status } = req.query;
  try {
    const params = [];
    let where = '';
    if (status) {
      params.push(status);
      where = 'WHERE c.status = $1';
    }

    const result = await pool.query(
      `
      SELECT c.*, u.name AS owner_name, u.email AS owner_email,
        COUNT(inv.id)::int AS investor_count
      FROM campaigns c
      LEFT JOIN users u ON c.owner_id = u.id
      LEFT JOIN investments inv ON c.id = inv.campaign_id
      ${where}
      GROUP BY c.id, u.name, u.email
      ORDER BY c.created_at DESC
    `,
      params,
    );

    res.json({ campaigns: result.rows });
  } catch (err) {
    console.error('Admin campaigns error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
module.exports = { getStats, getAllCampaigns };
