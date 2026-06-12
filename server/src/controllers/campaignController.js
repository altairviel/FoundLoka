const pool = require('../config/db');

//POST api/campaigns, owner membuat campaign baru, status defaultnya 'pending'
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

//GET api/campaigns, nyari semua campaigns yang lagi berlangsung
const getCampaigns = async (req, res) => {
  const { lat, lng, radius = 5, category } = req.query;

  try {
    const params = [];
    let where = `WHERE c.status IN ('active', 'funded', 'repaying', 'done')`;

    //filter kategori klw ada
    if (category) {
      params.push(category);
      where += ` AND c.category = $${params.length}`;
    }

    //filter dengan radius 5km
    if (lat && lng) {
      params.push(parseFloat(lat), parseFloat(lng), parseFloat(radius));
      const i = params.length;
      where += ` AND (
        6371 * acos(LEAST(1.0,
          cos(radians($${i - 2})) * cos(radians(c.lat)) *
          cos(radians(c.lng) - radians($${i - 1})) +
          sin(radians($${i - 2})) * sin(radians(c.lat))
        ))
      ) <= $${i}`;
    }

    const result = await pool.query(
      `
      SELECT c.*,
        u.name  AS owner_name,
        COUNT(inv.id)::int AS investor_count,
        COALESCE(ROUND((c.collected_amount /
          NULLIF(c.target_amount, 0)) * 100, 1), 0) AS progress_percent
      FROM campaigns c
      LEFT JOIN users u         ON c.owner_id   = u.id
      LEFT JOIN investments inv ON c.id = inv.campaign_id
      ${where}
      GROUP BY c.id, u.name
      ORDER BY c.created_at DESC
    `,
      params,
    );

    res.json({ campaigns: result.rows });
  } catch (err) {
    console.error('Get campaigns error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

//GET api/campaigns/my, agar owner yang sedang login dapat melihat campaign nya
const getMyCampaigns = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT c.*, COUNT(inv.id)::int AS investor_count
      FROM campaigns c
      LEFT JOIN investments inv ON c.id = inv.campaign_id
      WHERE c.owner_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `,
      [req.user.id],
    );

    res.json({ campaigns: result.rows });
  } catch (err) {
    console.error('Get my campaigns error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

//GET /api/campaigns/:id, mendapatkan info detail tentang satu campaign
const getCampaignById = async (req, res) => {
  const { id } = req.params;

  try {
    //data campaign, bisa melihat owner campaign dan progressnya
    const campaign = await pool.query(
      `
      SELECT c.*,
        u.name  AS owner_name,
        u.phone AS owner_phone,
        COUNT(inv.id)::int AS investor_count,
        COALESCE(ROUND((c.collected_amount /
          NULLIF(c.target_amount, 0)) * 100, 1), 0) AS progress_percent
      FROM campaigns c
      LEFT JOIN users u         ON c.owner_id = u.id
      LEFT JOIN investments inv ON c.id = inv.campaign_id
      WHERE c.id = $1
      GROUP BY c.id, u.name, u.phone
    `,
      [id],
    );

    if (campaign.rows.length === 0) {
      return res.status(404).json({ message: 'Kampanye tidak ditemukan' });
    }

    //daftar investor di kampanye ini
    const investors = await pool.query(
      `
      SELECT u.name, inv.amount, inv.created_at
      FROM investments inv
      JOIN users u ON inv.investor_id = u.id
      WHERE inv.campaign_id = $1
      ORDER BY inv.created_at DESC
    `,
      [id],
    );

    //jadwal cicilan
    const installments = await pool.query(
      `
      SELECT * FROM installments
      WHERE campaign_id = $1
      ORDER BY month_number ASC
    `,
      [id],
    );

    res.json({
      campaign: campaign.rows[0],
      investors: investors.rows,
      installments: installments.rows,
    });
  } catch (err) {
    console.error('Get campaign by id error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

//GET api/campaigns//map,data ringkas untuk pin di Leaflet map
const getMapData = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, category, status, lat, lng,
             collected_amount, target_amount
      FROM campaigns
      WHERE status IN ('active', 'funded', 'repaying', 'done')
    `);
    res.json({ locations: result.rows });
  } catch (err) {
    console.error('Map data error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = { createCampaign, getCampaigns, getMyCampaigns, getCampaignById, getMapData };
