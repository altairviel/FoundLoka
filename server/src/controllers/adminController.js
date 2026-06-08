const pool = require('../config/db');

//GET /api/admin/stats, untuk melihat statistik platform
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

//GET /api/admin/campaigns?status=pending
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

//PUT /api/admin/campaigns/:id/approve
// 1. KETIKA KAMPANYE DISETUJUI (APPROVED)
const approveCampaign = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE campaigns SET status = 'active'
       WHERE id = $1 AND status = 'pending' RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kampanye tidak ditemukan atau bukan pending' });
    }

    const ownerId = result.rows[0].owner_id;
    const msg = `Selamat! Kampanye Anda "${result.rows[0].title}" telah disetujui oleh admin.`;

    // Simpan notifikasi ke database
    await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [ownerId, msg]);

    res.json({ message: 'Kampanye berhasil disetujui' });
  } catch (err) {
    console.error('Approve error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// 2. KETIKA KAMPANYE DITOLAK (REJECTED)
const rejectCampaign = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE campaigns SET status = 'rejected'
       WHERE id = $1 AND status = 'pending' RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kampanye tidak ditemukan atau bukan pending' });
    }

    const ownerId = result.rows[0].owner_id;
    const msg = `Maaf, kampanye Anda "${result.rows[0].title}" ditolak oleh admin.`;

    // Simpan notifikasi ke database dengan parameter yang lengkap ($1 dan $2)
    await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [ownerId, msg]);

    res.json({ message: 'Kampanye berhasil ditolak' });
  } catch (err) {
    console.error('Reject error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

//PUT /api/admin/campaigns/:id/disburse, admin akan mencairkan dana ke UMKM setelah kampanye fully funded
// PUT /api/admin/campaigns/:id/disburse
const disburseCampaign = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect(); // Gunakan client pool khusus untuk transaksi

  try {
    await client.query('BEGIN'); // Mulai transaksi database

    // 1. Update status campaign dari funded ke repaying
    const result = await client.query(
      `UPDATE campaigns SET status = 'repaying'
       WHERE id = $1 AND status = 'funded' RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Kampanye tidak ditemukan atau belum funded' });
    }

    const campaign = result.rows[0];

    // 2. Ambil data untuk kalkulasi cicilan
    const targetAmount = parseFloat(campaign.target_amount);
    const returnRate = parseFloat(campaign.return_rate);
    const tenorMonths = parseInt(campaign.tenor_months);

    // Rumus hitung total pengembalian (Pokok + Bunga Flat)
    const totalReturn = targetAmount * (1 + returnRate / 100);
    const installmentAmount = Math.round(totalReturn / tenorMonths); // Pembulatan nominal per bulan

    // 3. Looping Generator Cicilan sesuai jumlah tenor
    for (let i = 1; i <= tenorMonths; i++) {
      // Hitung jatuh tempo bertambah 1 bulan setiap iterasi
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);

      await client.query(
        `INSERT INTO installments (id, campaign_id, month_number, due_date, amount, status)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending')`,
        [id, i, dueDate, installmentAmount],
      );
    }

    // 4. Buat notifikasi untuk pemilik UMKM
    await client.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [campaign.owner_id, `Dana kampanye "${campaign.title}" telah dicairkan. Mulai bayar cicilan sesuai jadwal.`]);

    await client.query('COMMIT'); // Simpan permanen semua perubahan ke database jika sukses
    res.json({ message: 'Dana berhasil dicairkan ke UMKM dan seluruh jadwal cicilan telah dibuat' });
  } catch (err) {
    await client.query('ROLLBACK'); // Batalkan semua perintah di atas jika di tengah jalan ada error
    console.error('Disburse error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server saat memproses pencairan' });
  } finally {
    client.release(); // Kembalikan koneksi ke pool
  }
};

module.exports = { getStats, getAllCampaigns, approveCampaign, rejectCampaign, disburseCampaign };
