// client/src/pages/Auth.jsx
import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import api from '../services/api';
// ✅ PERBAIKAN PATH: Mengambil logo secara dinamis dari folder assets sesuai struktur internal proyek
import folkFundLoginLogo from '../assets/Folk Fund Login.png';

export default function Auth({ setRole, setPage, setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState('investor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [coords, setCoords] = useState({ lat: null, lng: null });

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '', 
    password: '',
    confirmPassword: '',
  });

  // State untuk melacak mode mobile secara dinamis
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
  }, []);

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setError('');
    setSuccessMessage('');
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    setError('');
    setSuccessMessage('');
  };

  const fetchCurrentUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (err) {
      console.warn('Gagal fetch /auth/me:', err.message);
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password)
      return setError('Email dan password wajib diisi');

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data } = await api.post('/auth/login', {
        email: loginForm.email,
        password: loginForm.password,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const freshUser = await fetchCurrentUser();
      const userToStore = freshUser || data.user;

      if (freshUser) localStorage.setItem('user', JSON.stringify(freshUser));

      setSuccessMessage(`Selamat datang kembali, ${userToStore.name || userToStore.email}!`);

      setTimeout(() => {
        setUser(userToStore);
        setRole(userToStore.role);
        setPage('landing');
      }, 800);

    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;

      if (status === 401) {
        setError('Email atau password salah. Silakan coba lagi.');
      } else if (status === 404) {
        setError('Akun dengan email ini tidak ditemukan.');
      } else if (status === 429) {
        setError('Terlalu banyak percobaan login. Coba lagi beberapa saat.');
      } else if (!err.response) {
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError(serverMsg || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = registerForm;

    if (!name || !email || !password || !confirmPassword)
      return setError('Semua field wajib diisi');
    if (password !== confirmPassword)
      return setError('Password dan konfirmasi password tidak cocok');
    if (password.length < 6)
      return setError('Password minimal 6 karakter');

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        phone, 
        password,
        role: selectedRole === 'umkm' ? 'owner' : 'investor',
        lat: coords.lat,
        lng: coords.lng,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const freshUser = await fetchCurrentUser();
      const userToStore = freshUser || data.user;

      if (freshUser) localStorage.setItem('user', JSON.stringify(freshUser));

      setSuccessMessage(`Akun berhasil dibuat! Selamat datang, ${userToStore.name}!`);

      setTimeout(() => {
        setUser(userToStore);
        setRole(userToStore.role);
        setPage('landing');
      }, 800);

    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;

      if (status === 409 || serverMsg?.toLowerCase().includes('already')) {
        setError('Email ini sudah terdaftar. Silakan gunakan email lain atau login.');
      } else if (status === 400) {
        setError(serverMsg || 'Data yang dimasukkan tidak valid.');
      } else if (!err.response) {
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError(serverMsg || 'Registrasi gagal. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

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
    <div style={{ display: 'flex', minHeight: '100vh', background: T.gray50, flexDirection: isMobile ? 'column' : 'row' }}>
      
      {/* Kiri/Atas: Branding */}
      <div style={{ 
        flex: isMobile ? 'none' : 1, 
        background: T.greenDark, 
        color: T.white, 
        padding: isMobile ? '2rem 1.5rem' : '3rem', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        minHeight: isMobile ? 'auto' : '100vh'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* ✅ SEKARANG MENGGUNAKAN VARIABEL LOGO ASSETS YANG DIIMPORT DI ATAS */}
            <img src={folkFundLoginLogo} alt="FolkFund Logo" style={{ height: isMobile ? 38 : 48, objectFit: 'contain' }} />
          </div>
          <h1 style={{ 
            fontSize: isMobile ? '1.75rem' : '2.5rem', 
            fontWeight: 600, 
            marginTop: isMobile ? '1.5rem' : '4rem', 
            lineHeight: 1.2 
          }}>
            Membangun ekonomi,<br />satu UMKM pada satu waktu.
          </h1>
        </div>
        {!isMobile && (
          <div style={{ fontSize: 13, color: T.greenLight, opacity: 0.8 }}>© 2026 Folk Fund. All rights reserved.</div>
        )}
      </div>

      {/* Kanan/Bawah: Form Container */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: isMobile ? '1.5rem' : '2rem', 
        overflowY: 'auto' 
      }}>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, marginBottom: '0.5rem' }}>
            {isRegister ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
          </h2>
          <p style={{ color: T.gray500, fontSize: 14, marginBottom: isMobile ? '1.5rem' : '2rem' }}>
            {isRegister ? 'Daftar untuk mulai berinvestasi atau mencari pendanaan.' : 'Silakan masuk untuk mengakses dashboard Anda.'}
          </p>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div style={{ background: '#D1FAE5', color: '#065F46', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✅</span><span>{successMessage}</span>
            </div>
          )}

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
                <label className="ff-label">No. Telepon / HP</label>
                <input className="ff-input" type="text" name="phone" placeholder="Contoh: 08123456789" value={registerForm.phone} onChange={handleRegisterChange} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="ff-label">Password</label>
                <input className="ff-input" type="password" name="password" placeholder="Minimal 6 karakter" value={registerForm.password} onChange={handleRegisterChange} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="ff-label">Konfirmasi Password</label>
                <input className="ff-input" type="password" name="confirmPassword" placeholder="Ulangi password" value={registerForm.confirmPassword} onChange={handleRegisterChange} style={inputStyle} required />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label className="ff-label">Saya mendaftar sebagai:</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                  gap: '0.75rem', 
                  marginTop: '0.5rem' 
                }}>
                  {[
                    { key: 'investor', emoji: '📈', label: 'Investor', sub: 'Saya ingin berinvestasi' },
                    { key: 'umkm', emoji: '🏪', label: 'Pemilik UMKM', sub: 'Saya mencari pendanaan' },
                  ].map(({ key, emoji, label, sub }) => (
                    <div 
                      key={key} 
                      onClick={() => setSelectedRole(key)} 
                      style={{ 
                        border: `2px solid ${selectedRole === key ? T.green : T.gray200}`, 
                        background: selectedRole === key ? T.greenLight : T.white, 
                        padding: '1rem', 
                        borderRadius: 8, 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        display: isMobile ? 'flex' : 'block', 
                        alignItems: 'center', 
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: isMobile ? 0 : 4 }}>{emoji}</div>
                      <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: selectedRole === key ? T.greenDark : T.gray700 }}>{label}</div>
                        <div style={{ fontSize: 11, color: T.gray500, marginTop: 1 }}>{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="ff-btn ff-btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: 14, color: T.gray500, paddingBottom: isMobile ? '2rem' : 0 }}>
            {isRegister ? 'Sudah punya akun? ' : 'Belum terdaftar? '}
            <span style={{ color: T.green, fontWeight: 600, cursor: 'pointer' }} onClick={() => { setIsRegister(!isRegister); setError(''); setSuccessMessage(''); }}>
              {isRegister ? 'Masuk di sini' : 'Daftar sekarang'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}