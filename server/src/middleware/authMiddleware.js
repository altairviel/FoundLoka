const jwt = require('jsonwebtoken');

//cek authorization di header
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // cek header Authorization: Bearer {token}
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak, harap login dulu' });
  }

  const token = authHeader.split(' ')[1];
  try {
    //pakai token dari .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
  }
};

//hanya role admin saja
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses khusus admin' });
  }
  next();
};

//hanya owner umkm
const ownerOnly = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Akses khusus pemilik UMKM' });
  }
  next();
};

module.exports = { protect, adminOnly, ownerOnly };
