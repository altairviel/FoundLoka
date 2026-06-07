// server/src/controllers/investmentController.js
const pool = require('../config/db');

// ── Helper: insert notifikasi ──
const notify = async (userId, message) => {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [userId, message],
    );
  } catch (err) {
    // Notifikasi gagal tidak boleh gagalkan transaksi utama
    console.error('Notify error:', err.message);
  }
};

// ── Helper: format Rupiah ──
const rupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

// ── Helper: generate jadwal cicilan saat kampanye fully funded ──
const generateInstallments = async (campaign_id, campaign) => {
  const totalReturn   = parseFloat(campaign.target_amount) * (1 + parseFloat(campaign.return_rate) / 100);
  const monthlyAmount = Math.round(totalReturn / parseInt(campaign.tenor_months));
  const today         = new Date();

  for (let month = 1; month <= parseInt(campaign.tenor_months); month++) {
    const dueDate = new Date(today);
    dueDate.setMonth(dueDate.getMonth() + month);
    await pool.query(
      `INSERT INTO installments (campaign_id, month_number, due_date, amount)
       VALUES ($1, $2, $3, $4)`,
      [campaign_id, month, dueDate.toISOString().split('T')[0], monthlyAmount],
    );
  }
  console.log(`${campaign.tenor_months} cicilan digenerate untuk kampanye ${campaign_id}`);
};

// ── POST /api/investments ──
const createInvestment = async (req, res) => {
  const { campaign_id, amount } = req.body;
  const investor_id = req.user.id;

  if (!campaign_id || !amount) {
    return res.status(400).json({ message: 'campaign_id dan amount wajib diisi' });
  }
  if (parseFloat(amount) < 50000) {
    return res.status(400).json({ message: 'Minimal investasi Rp 50.000' });
  }

  try {
    // Ambil data kampanye
    const campaignResult = await pool.query(
      'SELECT c.*, u.name AS owner_name FROM campaigns c JOIN users u ON c.owner_id = u.id WHERE c.id = $1 AND c.status = $2',
      [campaign_id, 'active'],
    );
    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ message: 'Kampanye tidak ditemukan atau tidak aktif' });
    }

    const campaign = campaignResult.rows[0];

    if (campaign.owner_id === investor_id) {
      return res.status(400).json({ message: 'Tidak bisa investasi di kampanye sendiri' });
    }

    const remaining = parseFloat(campaign.target_amount) - parseFloat(campaign.collected_amount);
    if (parseFloat(amount) > remaining) {
      return res.status(400).json({
        message: `Melebihi sisa target. Maksimal investasi: Rp ${remaining.toLocaleString('id-ID')}`,
      });
    }

    // Ambil nama investor
    const investorResult = await pool.query('SELECT name FROM users WHERE id = $1', [investor_id]);
    const investorName   = investorResult.rows[0]?.name || 'Seorang investor';

    // Simpan investasi
    const investment = await pool.query(
      `INSERT INTO investments (investor_id, campaign_id, amount)
       VALUES ($1, $2, $3) RETURNING *`,
      [investor_id, campaign_id, amount],
    );

    // Update collected_amount kampanye
    const newCollected  = parseFloat(campaign.collected_amount) + parseFloat(amount);
    const isFullyFunded = newCollected >= parseFloat(campaign.target_amount);
    const newStatus     = isFullyFunded ? 'funded' : 'active';

    await pool.query(
      'UPDATE campaigns SET collected_amount = $1, status = $2 WHERE id = $3',
      [newCollected, newStatus, campaign_id],
    );

    // ── NOTIFIKASI 1: ke INVESTOR — konfirmasi investasi berhasil ──
    await notify(
      investor_id,
      `✅ Investasi kamu sebesar ${rupiah(amount)} ke kampanye "${campaign.title}" berhasil! ` +
      `Return ${campaign.return_rate}% akan dikirim sesuai jadwal.`,
    );

    // ── NOTIFIKASI 2: ke OWNER — ada investor baru masuk ──
    await notify(
      campaign.owner_id,
      `💰 ${investorName} baru saja menginvestasikan ${rupiah(amount)} ke kampanye "${campaign.title}". ` +
      `Total terkumpul: ${rupiah(newCollected)} dari target ${rupiah(campaign.target_amount)}.`,
    );

    // ── NOTIFIKASI 3: ke OWNER — kampanye fully funded ──
    if (isFullyFunded) {
      await generateInstallments(campaign_id, campaign);

      await notify(
        campaign.owner_id,
        `🎉 Selamat! Kampanye "${campaign.title}" telah mencapai target pendanaan ${rupiah(campaign.target_amount)}! ` +
        `Dana sedang diproses untuk pencairan. Pantau jadwal cicilan di dashboard kamu.`,
      );

      // ── NOTIFIKASI 4: ke semua INVESTOR kampanye — kampanye fully funded ──
      const allInvestors = await pool.query(
        'SELECT DISTINCT investor_id FROM investments WHERE campaign_id = $1',
        [campaign_id],
      );
      for (const row of allInvestors.rows) {
        await notify(
          row.investor_id,
          `🎉 Kampanye "${campaign.title}" yang kamu danai telah mencapai target! ` +
          `Return investasi akan mulai berjalan sesuai jadwal cicilan.`,
        );
      }
    }

    res.status(201).json({
      message: 'Investasi berhasil',
      investment: investment.rows[0],
      campaign_status: newStatus,
      fully_funded: isFullyFunded,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Kamu sudah pernah investasi di kampanye ini' });
    }
    console.error('Create investment error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ── GET /api/investments/my ──
const getMyInvestments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        inv.*,
        c.title, c.category, c.status   AS campaign_status,
        c.return_rate, c.tenor_months,
        c.collected_amount, c.target_amount,
        u.name AS owner_name,
        ROUND(inv.amount * (1 + c.return_rate / 100), 0) AS expected_return,
        COALESCE((
          SELECT COUNT(*) FROM installments
          WHERE campaign_id = c.id AND status = 'paid'
        ), 0)::int AS installments_paid
      FROM investments inv
      JOIN campaigns c ON inv.campaign_id = c.id
      JOIN users    u ON c.owner_id       = u.id
      WHERE inv.investor_id = $1
      ORDER BY inv.created_at DESC`,
      [req.user.id],
    );
    res.json({ investments: result.rows });
  } catch (err) {
    console.error('Get my investments error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ── GET /api/investments/campaign/:id ──
const getCampaignInvestors = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT
        inv.id, inv.amount, inv.created_at,
        u.name AS investor_name,
        ROUND((inv.amount / NULLIF(c.target_amount, 0)) * 100, 1) AS ownership_percent
      FROM investments inv
      JOIN users     u ON inv.investor_id  = u.id
      JOIN campaigns c ON inv.campaign_id  = c.id
      WHERE inv.campaign_id = $1
      ORDER BY inv.amount DESC`,
      [id],
    );
    res.json({ investors: result.rows });
  } catch (err) {
    console.error('Get campaign investors error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = { createInvestment, getMyInvestments, getCampaignInvestors };