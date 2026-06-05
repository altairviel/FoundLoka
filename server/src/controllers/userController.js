const pool = require('../config/db');
const bcrypt = require('bcryptjs');

//PUT /api/users/profile
const updateProfile = async (req, res) => {
  const { name, phone, lat, lng } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users
       SET name  = COALESCE($1, name),
           phone = COALESCE($2, phone),
           lat   = COALESCE($3, lat),
           lng   = COALESCE($4, lng)
       WHERE id = $5
       RETURNING id, name, email, role, phone, lat, lng`,
      [name, phone, lat, lng, req.user.id],
    );
    res.json({ message: 'Profil berhasil diupdate', user: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

//PUT /api/users/password
const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Password lama dan baru wajib diisi' });
  if (newPassword.length < 6) return res.status(400).json({ message: 'Password baru minimal 6 karakter' });

  try {
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(oldPassword, result.rows[0].password);
    if (!isMatch) return res.status(400).json({ message: 'Password lama tidak benar' });

    const hashed = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);

    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    console.error('Update password error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = { updateProfile, updatePassword };
