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

module.exports = { getStats };
