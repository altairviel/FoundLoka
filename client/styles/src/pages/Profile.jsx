// client/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import StatCard from '../components/StatCard';
import { getMe, updateProfile, updatePassword } from '../services/user';

export default function Profile({ user, setUser, role }) {
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const [isEditing, setIsEditing]         = useState(false);
  const [editForm, setEditForm]           = useState({ name: '', phone: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  // Tab ubah password
  const [showPasswordForm, setShowPasswordForm]     = useState(false);
  const [passwordForm, setPasswordForm]             = useState({ oldPassword: '', newPassword: '', confirmNew: '' });
  const [passwordLoading, setPasswordLoading]       = useState(false);
  const [passwordError, setPasswordError]           = useState(''); // ✅ State khusus error password

  // ✅ State untuk melacak mode mobile secara dinamis
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Backend: GET /api/auth/me
        const { data } = await getMe();
        setProfile(data);
        setEditForm({ name: data.name || '', phone: data.phone || '' });
        localStorage.setItem('user', JSON.stringify(data));
        if (setUser) setUser(data);
      } catch (err) {
        setError('Gagal memuat profil. Menampilkan data tersimpan.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setUser]);

  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // PUT /api/users/profile  { name, phone }
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return setError('Nama lengkap tidak boleh kosong');

    setUpdateLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await updateProfile({ name: editForm.name, phone: editForm.phone });
      const updated = data.user || data;
      setProfile(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      if (setUser) setUser(updated);
      setSuccess('Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // PUT /api/users/password  { oldPassword, newPassword }
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError(''); 
    setError('');         
    setSuccess('');

    if (!passwordForm.oldPassword || !passwordForm.newPassword) return setPasswordError('Semua field password wajib diisi');
    if (passwordForm.newPassword.length < 6) return setPasswordError('Password baru minimal 6 karakter');
    if (passwordForm.newPassword !== passwordForm.confirmNew) return setPasswordError('Konfirmasi password tidak cocok');

    setPasswordLoading(true);

    try {
      await updatePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword });
      setSuccess('Password berhasil diubah!');
      setShowPasswordForm(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      if (backendMessage === 'Password lama tidak benar') {
        setPasswordError('Password lama yang Anda masukkan masih salah.');
      } else {
        setPasswordError(backendMessage || 'Gagal mengubah password. Pastikan password lama benar.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 56px)' }}>
      <p style={{ color: T.gray500 }}>Memuat profil...</p>
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: `1px solid ${T.gray200}`, borderRadius: 6,
    outline: 'none', boxSizing: 'border-box',
    background: T.white, color: T.gray700
  };

  return (
    <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)', padding: isMobile ? '1rem 0' : '2rem 0' }}>
      <div className="ff-container" style={{ padding: isMobile ? '0 1rem' : '0 2rem' }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, marginBottom: '1.5rem' }}>Profil Pengguna</h1>

        {error && (
          <div style={{ background: '#FEF3C7', color: '#92400E', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#D1FAE5', color: '#065F46', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1rem' }}>
            ✅ {success}
          </div>
        )}

        {/* ✅ Mengubah grid 2 kolom menjadi 1 kolom jika di layar HP */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', 
          gap: '1.5rem', 
          alignItems: 'start' 
        }}>
          {/* Bagian Kiri/Utama */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Header Profil */}
            <div className="ff-card" style={{ 
              display: 'flex', 
              gap: '1rem', 
              alignItems: isMobile ? 'flex-start' : 'center', 
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row',
                textAlign: isMobile ? 'center' : 'left',
                width: isMobile ? '100%' : 'auto'
              }}>
                <div style={{
                  width: isMobile ? 70 : 80, height: isMobile ? 70 : 80, borderRadius: '50%',
                  background: T.greenLight, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: isMobile ? 24 : 28, fontWeight: 700, color: T.green,
                  border: `2px solid ${T.green}`,
                  flexShrink: 0
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: 8, marginBottom: 4 }}>
                    <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, wordBreak: 'break-word' }}>{profile?.name || '—'}</h2>
                  </div>
                  <p style={{ color: T.gray500, fontSize: 13, marginBottom: 8, wordBreak: 'break-all' }}>{profile?.email}</p>
                  <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                    <span className="ff-badge ff-badge-green">
                      {role === 'investor' ? 'Investor Aktif' : role === 'owner' ? 'Pemilik UMKM' : 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditForm({ name: profile?.name || '', phone: profile?.phone || '' });
                    setError('');
                    setSuccess('');
                  }}
                  className="ff-btn"
                  style={{ 
                    padding: '8px 16px',
                    width: isMobile ? '100%' : 'auto',
                    marginTop: isMobile ? '0.5rem' : 0
                  }}
                >
                  Edit Profil
                </button>
              )}
            </div>

            {/* Info detail / Form Edit */}
            <div className="ff-card">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Informasi Akun</h3>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.gray700, marginBottom: 6 }}>Nama Lengkap</label>
                    <input style={inputStyle} type="text" name="name" value={editForm.name} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.gray700, marginBottom: 6 }}>No. Telepon / HP</label>
                    <input style={inputStyle} type="text" name="phone" value={editForm.phone} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.gray500, marginBottom: 4 }}>Email (Tidak dapat diubah)</label>
                    <input style={{ ...inputStyle, background: T.gray100, color: T.gray500, cursor: 'not-allowed' }} type="text" value={profile?.email} disabled />
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setError(''); }}
                      style={{ ...inputStyle, width: isMobile ? '100%' : 'auto', padding: '10px 16px', cursor: 'pointer', background: T.white, border: `1px solid ${T.gray300}` }}
                      disabled={updateLoading}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '10px 16px', width: isMobile ? '100%' : 'auto', background: T.green, color: T.white, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, opacity: updateLoading ? 0.7 : 1 }}
                      disabled={updateLoading}
                    >
                      {updateLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 14 }}>
                  {[
                    ['Nama Lengkap', profile?.name],
                    ['Email', profile?.email],
                    ['No. Telepon', profile?.phone || '—'],
                    ['Role', profile?.role],
                    ['Bergabung', profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
                  ].map(([label, val]) => (
                    <div key={label} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 4 : 0,
                      paddingBottom: '0.75rem', 
                      borderBottom: `1px solid ${T.gray100}` 
                    }}>
                      <span style={{ color: T.gray500, fontSize: 13 }}>{label}</span>
                      <span style={{ fontWeight: 500, wordBreak: 'break-word' }}>{val || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ubah Password */}
            <div className="ff-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPasswordForm ? '1rem' : 0 }}>
                <h3 style={{ fontWeight: 600 }}>Ubah Password</h3>
                <button
                  className="ff-btn ff-btn-sm"
                  onClick={() => { setShowPasswordForm((p) => !p); setError(''); setSuccess(''); setPasswordError(''); }}
                >
                  {showPasswordForm ? 'Tutup' : 'Ubah'}
                </button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 4 }}>
                  {passwordError && (
                    <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '8px 12px', borderRadius: 6 }}>
                      ⚠️ {passwordError}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.gray700, marginBottom: 6 }}>Password Lama</label>
                    <input style={inputStyle} type="password" value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.gray700, marginBottom: 6 }}>Password Baru</label>
                    <input style={inputStyle} type="password" value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.gray700, marginBottom: 6 }}>Konfirmasi Password Baru</label>
                    <input style={inputStyle} type="password" value={passwordForm.confirmNew}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmNew: e.target.value })} required />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      style={{ padding: '10px 16px', width: isMobile ? '100%' : 'auto', background: T.green, color: T.white, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, opacity: passwordLoading ? 0.7 : 1 }}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Menyimpan...' : 'Simpan Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Bagian Kanan/Sidebar (Akan bertumpuk ke bawah di HP) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <StatCard
              label={role === 'investor' ? 'Tipe Akun' : 'Status'}
              value={role === 'investor' ? 'Investor' : 'Pemilik UMKM'}
              accent
            />
            <div className="ff-card">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Lokasi</h3>
              <div style={{ fontSize: 14, color: T.gray500 }}>
                {profile?.lat && profile?.lng
                  ? `📍 ${Number(profile.lat).toFixed(4)}, ${Number(profile.lng).toFixed(4)}`
                  : '📍 Lokasi tidak tersedia'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}