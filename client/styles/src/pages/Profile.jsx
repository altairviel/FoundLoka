// client/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import StatCard from '../components/StatCard';
import { getMe } from '../services/user';
import api from '../services/api'; // Menggunakan instance api untuk proses PUT update

export default function Profile({ user, setUser, role }) {
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ BARU: State untuk menangani mode editing profil
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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

  // ✅ BARU: Handler perubahan input edit
  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // ✅ BARU: Handler kirim data update ke back-end
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return setError('Nama lengkap tidak boleh kosong');

    setUpdateLoading(true);
    setError('');
    setSuccess('');

    try {
      // Mengirim request PUT ke endpoint update profile (/auth/update atau /user/update sesuai setelan backend)
      const { data } = await api.put('/auth/update-profile', {
        name: editForm.name,
        phone: editForm.phone,
      });

      // Update state lokal komponen
      setProfile(data.user || data);
      localStorage.setItem('user', JSON.stringify(data.user || data));
      if (setUser) setUser(data.user || data);

      setSuccess('Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 56px)' }}>
      <p style={{ color: T.gray500 }}>Memuat profil...</p>
    </div>
  );

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: 14,
    border: `1px solid ${T.gray200}`,
    borderRadius: 6,
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)', padding: '2rem 0' }}>
      <div className="ff-container">
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Profil Pengguna</h1>

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
          {/* Kiri */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div className="ff-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: T.greenLight, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, fontWeight: 700, color: T.green,
                  border: `2px solid ${T.green}`,
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700 }}>{profile?.name || '—'}</h2>
                  </div>
                  <p style={{ color: T.gray500, fontSize: 14, marginBottom: 8 }}>{profile?.email}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="ff-badge ff-badge-green">
                      {role === 'investor' ? 'Investor Aktif' : role === 'owner' ? 'Pemilik UMKM' : 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* ✅ Tombol trigger edit */}
              {!isEditing && (
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setEditForm({ name: profile?.name || '', phone: profile?.phone || '' });
                  }}
                  className="ff-btn"
                  style={{ padding: '8px 16px', background: T.white, border: `1px solid ${T.gray300}`, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
                >
                  Edit Profil
                </button>
              )}
            </div>

            {/* Info detail / Form Edit */}
            <div className="ff-card">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Informasi Akun</h3>
              
              {isEditing ? (
                // ✅ TAMPILAN MODE EDIT FORM
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
                    <input style={{ ...inputStyle, background: T.gray100, color: T.gray400, cursor: 'not-allowed' }} type="text" value={profile?.email} disabled />
                  </div>
                  
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => { setIsEditing(false); setError(''); }} 
                      style={{ padding: '8px 16px', background: T.white, border: `1px solid ${T.gray300}`, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
                      disabled={updateLoading}
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      style={{ padding: '8px 16px', background: T.green, color: T.white, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, opacity: updateLoading ? 0.7 : 1 }}
                      disabled={updateLoading}
                    >
                      {updateLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              ) : (
                // TAMPILAN DATA BIASA
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 14 }}>
                  {[
                    ['Nama Lengkap', profile?.name],
                    ['Email', profile?.email],
                    ['No. Telepon', profile?.phone || '—'],
                    ['Role', profile?.role],
                    ['Bergabung', profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: `1px solid ${T.gray100}` }}>
                      <span style={{ color: T.gray500 }}>{label}</span>
                      <span style={{ fontWeight: 500 }}>{val || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kanan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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