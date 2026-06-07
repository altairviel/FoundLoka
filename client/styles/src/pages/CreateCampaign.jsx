// client/styles/src/pages/CreateCampaign.jsx
import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import api from '../services/api';

const CATEGORIES = ['Kuliner', 'Fashion', 'Agrikultur', 'Kerajinan', 'Perikanan', 'Teknologi', 'Lainnya'];

const STEPS = ['Info Usaha', 'Detail Pendanaan', 'Lokasi', 'Konfirmasi'];

export default function CreateCampaign({ user, onSuccess, onCancel }) {
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title:        '',
    description:  '',
    category:     'Kuliner',
    target_amount: '',
    return_rate:  '',
    tenor_months: '',
    deadline:     '',
    address:      '',
    lat:          '',
    lng:          '',
  });

  // Ambil koordinat GPS otomatis
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setForm((f) => ({
        ...f,
        lat: pos.coords.latitude.toFixed(6),
        lng: pos.coords.longitude.toFixed(6),
      })),
      () => {}
    );
  }, []);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError('');
  };

  // ── Validasi per step ──
  const validate = () => {
    if (step === 0) {
      if (!form.title.trim())       return 'Nama usaha wajib diisi';
      if (!form.description.trim()) return 'Deskripsi wajib diisi';
      if (!form.category)           return 'Pilih kategori';
    }
    if (step === 1) {
      if (!form.target_amount || isNaN(form.target_amount) || parseFloat(form.target_amount) < 1000000)
        return 'Target modal minimal Rp 1.000.000';
      if (!form.return_rate || isNaN(form.return_rate) || parseFloat(form.return_rate) < 1 || parseFloat(form.return_rate) > 50)
        return 'Return rate harus antara 1% – 50%';
      if (!form.tenor_months || isNaN(form.tenor_months) || parseInt(form.tenor_months) < 1 || parseInt(form.tenor_months) > 60)
        return 'Tenor harus antara 1 – 60 bulan';
    }
    if (step === 2) {
      if (!form.address.trim()) return 'Alamat usaha wajib diisi';
      if (!form.lat || !form.lng)  return 'Koordinat GPS diperlukan. Izinkan akses lokasi atau isi manual.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validate();
    if (err) return setError(err);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // POST /api/campaigns
      await api.post('/campaigns', {
        title:        form.title.trim(),
        description:  form.description.trim(),
        category:     form.category,
        target_amount: parseFloat(form.target_amount),
        return_rate:  parseFloat(form.return_rate),
        tenor_months: parseInt(form.tenor_months),
        address:      form.address.trim(),
        lat:          parseFloat(form.lat),
        lng:          parseFloat(form.lng),
        deadline:     form.deadline || null,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan kampanye. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: `1px solid ${T.gray200}`, borderRadius: 8,
    outline: 'none', boxSizing: 'border-box', background: T.white,
  };

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 500,
    color: T.gray700, marginBottom: 6,
  };

  // ── Tampilan sukses ──
  if (success) return (
    <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="ff-card" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: 56, marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: '0.75rem' }}>Kampanye Berhasil Diajukan!</h2>
        <p style={{ fontSize: 14, color: T.gray500, lineHeight: 1.7, marginBottom: '2rem' }}>
          Kampanye kamu sedang menunggu persetujuan admin. Proses verifikasi biasanya memakan waktu 1–3 hari kerja.
          Kamu akan mendapat notifikasi saat kampanye disetujui.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onSuccess}
            style={{
              padding: '12px', background: T.green, color: T.white,
              border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Lihat Kampanye Saya →
          </button>
          <button className="ff-btn" onClick={onCancel}>Kembali ke Beranda</button>
        </div>
      </div>
    </div>
  );

  // Estimasi cicilan bulanan untuk preview
  const estMonthly = form.target_amount && form.return_rate && form.tenor_months
    ? Math.round(
        (parseFloat(form.target_amount) * (1 + parseFloat(form.return_rate) / 100))
        / parseInt(form.tenor_months)
      )
    : null;

  return (
    <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)', padding: '2rem 0' }}>
      <div className="ff-container" style={{ maxWidth: 680 }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button className="ff-btn ff-btn-sm" onClick={onCancel} style={{ marginBottom: '1rem' }}>
            ← Kembali
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Ajukan Kampanye Baru</h1>
          <p style={{ fontSize: 14, color: T.gray500 }}>
            Isi formulir berikut untuk mendapatkan pendanaan dari investor.
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '2rem' }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {i > 0 && (
                  <div style={{ flex: 1, height: 2, background: i <= step ? T.green : T.gray200 }} />
                )}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: i < step ? T.green : i === step ? T.green : T.gray200,
                  color: i <= step ? T.white : T.gray500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < step ? T.green : T.gray200 }} />
                )}
              </div>
              <div style={{ fontSize: 11, marginTop: 6, color: i === step ? T.green : T.gray500, fontWeight: i === step ? 600 : 400 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="ff-card">
          {error && (
            <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1.25rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* ── Step 0: Info Usaha ── */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Informasi Usaha</h2>

              <div>
                <label style={labelStyle}>Nama Usaha <span style={{ color: '#EF4444' }}>*</span></label>
                <input style={inputStyle} type="text" value={form.title}
                  onChange={set('title')} placeholder="Contoh: Warung Makan Sederhana Bu Siti" />
              </div>

              <div>
                <label style={labelStyle}>Kategori <span style={{ color: '#EF4444' }}>*</span></label>
                <select style={inputStyle} value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Deskripsi Usaha <span style={{ color: '#EF4444' }}>*</span></label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical' }}
                  rows={5}
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Ceritakan tentang usaha kamu, produk/jasa yang ditawarkan, sejarah usaha, dan potensi perkembangan ke depan..."
                />
                <div style={{ fontSize: 12, color: T.gray500, marginTop: 4, textAlign: 'right' }}>
                  {form.description.length} karakter
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Detail Pendanaan ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Detail Pendanaan</h2>

              <div>
                <label style={labelStyle}>Target Modal (Rp) <span style={{ color: '#EF4444' }}>*</span></label>
                <input style={inputStyle} type="number" min={1000000} step={500000}
                  value={form.target_amount} onChange={set('target_amount')}
                  placeholder="Contoh: 10000000" />
                {form.target_amount && !isNaN(form.target_amount) && (
                  <div style={{ fontSize: 12, color: T.green, marginTop: 4 }}>
                    = Rp {parseInt(form.target_amount).toLocaleString('id-ID')}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Return Rate (%) <span style={{ color: '#EF4444' }}>*</span></label>
                  <input style={inputStyle} type="number" min={1} max={50} step={0.5}
                    value={form.return_rate} onChange={set('return_rate')}
                    placeholder="Contoh: 15" />
                  <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>Per tahun, 1% – 50%</div>
                </div>
                <div>
                  <label style={labelStyle}>Tenor (bulan) <span style={{ color: '#EF4444' }}>*</span></label>
                  <input style={inputStyle} type="number" min={1} max={60}
                    value={form.tenor_months} onChange={set('tenor_months')}
                    placeholder="Contoh: 12" />
                  <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>1 – 60 bulan</div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Deadline Pendanaan</label>
                <input style={inputStyle} type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.deadline} onChange={set('deadline')} />
                <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>Opsional. Batas waktu kampanye menerima investasi.</div>
              </div>

              {/* Preview kalkulasi */}
              {estMonthly && (
                <div style={{
                  background: T.greenLight, border: `1px solid ${T.green}30`,
                  borderRadius: 8, padding: '1rem',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.greenDark, marginBottom: 8 }}>
                    📊 Preview Kalkulasi
                  </div>
                  {[
                    ['Modal yang dicari', `Rp ${parseInt(form.target_amount).toLocaleString('id-ID')}`],
                    ['Total dikembalikan', `Rp ${Math.round(parseFloat(form.target_amount) * (1 + parseFloat(form.return_rate) / 100)).toLocaleString('id-ID')}`],
                    ['Cicilan per bulan', `Rp ${estMonthly.toLocaleString('id-ID')}`],
                    ['Durasi',            `${form.tenor_months} bulan`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: T.gray700 }}>{k}</span>
                      <span style={{ fontWeight: 600, color: T.greenDark }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Lokasi ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Lokasi Usaha</h2>

              <div>
                <label style={labelStyle}>Alamat Lengkap <span style={{ color: '#EF4444' }}>*</span></label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical' }}
                  rows={3}
                  value={form.address}
                  onChange={set('address')}
                  placeholder="Contoh: Jl. Sudirman No. 12, Kelurahan Sukamaju, Kec. Tampan, Pekanbaru, Riau 28291"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Latitude <span style={{ color: '#EF4444' }}>*</span></label>
                  <input style={inputStyle} type="number" step="0.000001"
                    value={form.lat} onChange={set('lat')} placeholder="Contoh: 0.507068" />
                </div>
                <div>
                  <label style={labelStyle}>Longitude <span style={{ color: '#EF4444' }}>*</span></label>
                  <input style={inputStyle} type="number" step="0.000001"
                    value={form.lng} onChange={set('lng')} placeholder="Contoh: 101.447777" />
                </div>
              </div>

              {form.lat && form.lng ? (
                <div style={{
                  background: T.greenLight, border: `1px solid ${T.green}30`,
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, color: T.greenDark,
                }}>
                  ✅ Koordinat GPS terdeteksi: {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}
                </div>
              ) : (
                <div style={{
                  background: '#FEF3C7', border: '1px solid #FDE68A',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400E',
                }}>
                  ⚠️ Koordinat belum terisi. Izinkan akses lokasi di browser atau isi manual di atas.
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Konfirmasi ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Konfirmasi & Ajukan</h2>
              <p style={{ fontSize: 14, color: T.gray500, marginBottom: 8 }}>
                Periksa kembali data kampanye kamu sebelum diajukan ke admin untuk diverifikasi.
              </p>

              {[
                ['Nama Usaha',    form.title],
                ['Kategori',      form.category],
                ['Target Modal',  `Rp ${parseInt(form.target_amount).toLocaleString('id-ID')}`],
                ['Return Rate',   `${form.return_rate}% / tahun`],
                ['Tenor',         `${form.tenor_months} bulan`],
                ['Est. cicilan/bln', estMonthly ? `Rp ${estMonthly.toLocaleString('id-ID')}` : '—'],
                ['Deadline',      form.deadline ? new Date(form.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tidak ada'],
                ['Alamat',        form.address],
                ['Koordinat',     `${parseFloat(form.lat).toFixed(4)}, ${parseFloat(form.lng).toFixed(4)}`],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4,
                  paddingBottom: '0.75rem', borderBottom: `1px solid ${T.gray100}`,
                  fontSize: 14,
                }}>
                  <span style={{ color: T.gray500 }}>{k}</span>
                  <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                </div>
              ))}

              <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#92400E', marginTop: 8 }}>
                ℹ️ Setelah diajukan, kampanye akan berstatus <strong>pending</strong> hingga admin menyetujuinya. Kamu tidak dapat mengedit kampanye yang sedang dalam proses verifikasi.
              </div>
            </div>
          )}

          {/* ── Navigasi tombol ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: 10 }}>
            <button
              className="ff-btn"
              onClick={step === 0 ? onCancel : handleBack}
              disabled={loading}
            >
              {step === 0 ? 'Batal' : '← Sebelumnya'}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                style={{
                  padding: '10px 24px', background: T.green, color: T.white,
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Selanjutnya →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: '10px 24px', background: T.green, color: T.white,
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Mengajukan...' : '✅ Ajukan Kampanye'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}