const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

//post /api/auth/register, role nnya investor/owner
const register = async (req, res) => {
  const { name, email, password, role, phone, lat, lng } = req.body; //body berisi name, email, password, role, phone, lat, lng

  //validasi
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
  }

  try {
    //ngecek email sudah terdaftar atau belum?
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    //hash password sebelum disimpan, agar tidak menyimpan password asli
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //simpan user baru ke database
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, phone, created_at`,
      [name, email, hashedPassword, role || 'investor', phone || null, lat || null, lng || null],
    );

    const user = result.rows[0];

    //buat JWT token 7 hari
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user,
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
