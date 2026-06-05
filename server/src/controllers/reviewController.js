const pool = require('../config/db');

//POST /api/reviews
const createReview = async (req, res) => {
  const { campaign_id, rating, comment } = req.body;

  if (!campaign_id || !rating) return res.status(400).json({ message: 'campaign_id dan rating wajib diisi' });
  if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating harus antara 1 sampai 5' });

  try {
    //hanya investor yang sudah invest di kampanye ini yang bisa review
    const invested = await pool.query('SELECT id FROM investments WHERE investor_id = $1 AND campaign_id = $2', [req.user.id, campaign_id]);
    if (invested.rows.length === 0) return res.status(403).json({ message: 'Kamu hanya bisa review kampanye yang sudah kamu investasi' });

    const result = await pool.query(
      `INSERT INTO reviews (investor_id, campaign_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, campaign_id, rating, comment],
    );
    res.status(201).json({ message: 'Review berhasil dikirim', review: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Kamu sudah pernah review kampanye ini' });
    console.error('Create review error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = { createReview };
