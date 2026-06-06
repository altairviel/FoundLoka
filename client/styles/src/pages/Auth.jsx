// client/src/pages/Auth.jsx
import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import api from '../services/api';

export default function Auth({ setRole, setPage, setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState('investor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState({ lat: null, lng: null });

  // Form state — login hanya butuh email + password
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Form state — register butuh lebih banyak field
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Ambil GPS user diam-diam saat halaman dibuka (untuk register)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {}, // kalau ditolak, biarkan null — tidak wajib
    );
  }, []);

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    setError('');
  };

  // ── SUBMIT LOGIN ──────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) return setError('Email dan password wajib diisi');

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', {
        email: loginForm.email,
        password: loginForm.password,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setRole(data.user.role); // role dari backend: investor / owner / admin
      setPage('landing');
    } catch (err) {
      setError(err?.response?.data?.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  // ── SUBMIT REGISTER ───────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = registerForm;

    if (!name || !email || !password || !confirmPassword) return setError('Semua field wajib diisi');

    if (password !== confirmPassword) return setError('Password dan konfirmasi password tidak cocok');

    if (password.length < 6) return setError('Password minimal 6 karakter');

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        role: selectedRole === 'umkm' ? 'owner' : 'investor',
        lat: coords.lat,
        lng: coords.lng,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setRole(data.user.role);
      setPage('landing');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registrasi gagal, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  // ── INPUT STYLE ───────────────────────────────────
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: `1px solid ${T.gray200}`,
    borderRadius: 8,
    outline: 'none',
    boxSizing: 'border-box',
    background: T.white,
    color: T.gray700,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.gray50 }}>
      {/* ── Kiri: Branding ── */}
      <div
        style={{
          flex: 1,
          background: T.greenDark,
          color: T.white,
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/Folk Fund Login.png" alt="FoundLoka Logo" style={{ height: 48, objectFit: 'contain' }} />
          </div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 600,
              marginTop: '4rem',
              lineHeight: 1.2,
            }}
          >
            Membangun ekonomi,
            <br />
            satu UMKM pada satu waktu.
          </h1>
        </div>
        <div style={{ fontSize: 13, color: T.greenLight, opacity: 0.8 }}>© 2026 Folk Fund. All rights reserved.</div>
      </div>

      {/* ── Kanan: Form ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          overflowY: 'auto',
        }}
      >
        <div style={{ maxWidth: 400, width: '100%' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: '0.5rem' }}>{isRegister ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}</h2>
          <p style={{ color: T.gray500, fontSize: 14, marginBottom: '2rem' }}>{isRegister ? 'Daftar untuk mulai berinvestasi atau mencari pendanaan.' : 'Silakan masuk untuk mengakses dashboard Anda.'}</p>

          {/* ── Pesan Error ── */}
          {error && (
            <div
              style={{
                background: '#FEE2E2',
                color: '#B91C1C',
                fontSize: 13,
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          {/* ════════════════════════════
              FORM LOGIN
          ════════════════════════════ */}
          {!isRegister && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="ff-label">Email</label>
                <input className="ff-input" type="email" name="email" placeholder="contoh@email.com" value={loginForm.email} onChange={handleLoginChange} style={inputStyle} required />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="ff-label">Password</label>
                <input className="ff-input" type="password" name="password" placeholder="••••••••" value={loginForm.password} onChange={handleLoginChange} style={inputStyle} required />
              </div>

              <button type="submit" className="ff-btn ff-btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          )}

          {/* ════════════════════════════
              FORM REGISTER
          ════════════════════════════ */}
          {isRegister && (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="ff-label">Nama Lengkap</label>
                <input className="ff-input" type="text" name="name" placeholder="Masukkan nama lengkap Anda" value={registerForm.name} onChange={handleRegisterChange} style={inputStyle} required />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="ff-label">Email</label>
                <input className="ff-input" type="email" name="email" placeholder="contoh@email.com" value={registerForm.email} onChange={handleRegisterChange} style={inputStyle} required />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="ff-label">Password</label>
                <input className="ff-input" type="password" name="password" placeholder="Minimal 6 karakter" value={registerForm.password} onChange={handleRegisterChange} style={inputStyle} required />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="ff-label">Konfirmasi Password</label>
                <input className="ff-input" type="password" name="confirmPassword" placeholder="Ulangi password" value={registerForm.confirmPassword} onChange={handleRegisterChange} style={inputStyle} required />
              </div>

              {/* Pilihan Role — hanya muncul saat Register */}
              <div style={{ marginBottom: '2rem' }}>
                <label className="ff-label">Saya mendaftar sebagai:</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <div
                    onClick={() => setSelectedRole('investor')}
                    style={{
                      border: `2px solid ${selectedRole === 'investor' ? T.green : T.gray200}`,
                      background: selectedRole === 'investor' ? T.greenLight : T.white,
                      padding: '1rem',
                      borderRadius: 8,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>📈</div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: selectedRole === 'investor' ? T.greenDark : T.gray700,
                      }}
                    >
                      Investor
                    </div>
                    <div style={{ fontSize: 11, color: T.gray500, marginTop: 2 }}>Saya ingin berinvestasi</div>
                  </div>
                  <div
                    onClick={() => setSelectedRole('umkm')}
                    style={{
                      border: `2px solid ${selectedRole === 'umkm' ? T.green : T.gray200}`,
                      background: selectedRole === 'umkm' ? T.greenLight : T.white,
                      padding: '1rem',
                      borderRadius: 8,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>🏪</div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: selectedRole === 'umkm' ? T.greenDark : T.gray700,
                      }}
                    >
                      Pemilik UMKM
                    </div>
                    <div style={{ fontSize: 11, color: T.gray500, marginTop: 2 }}>Saya mencari pendanaan</div>
                  </div>
                </div>
              </div>

              <button type="submit" className="ff-btn ff-btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </form>
          )}

          {/* Toggle Login / Register */}
          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: 14, color: T.gray500 }}>
            {isRegister ? 'Sudah punya akun? ' : 'Belum terdaftar? '}
            <span
              style={{ color: T.green, fontWeight: 600, cursor: 'pointer' }}
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
            >
              {isRegister ? 'Masuk di sini' : 'Daftar sekarang'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
