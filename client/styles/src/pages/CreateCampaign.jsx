import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import api from '../services/api';

const CATEGORIES = ['Kuliner', 'Fashion', 'Agrikultur', 'Kerajinan', 'Perikanan', 'Teknologi', 'Lainnya'];
const STEPS = ['Info Usaha', 'Detail Pendanaan', 'Lokasi', 'Konfirmasi'];

const rupiah = (n) => (n ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n) : '—');

export default function CreateCampaign({ user, onSuccess, onCancel }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Kuliner',
    target_amount: '',
    return_rate: '',
    tenor_months: '',
    repayment_type: 'cicilan',
    deadline: '',
    address: '',
    lat: '',
    lng: '',
  });

  // Ambil GPS otomatis
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        })),
      () => {},
    );
  }, []);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError('');
  };

  // Validasi per step
  const validate = () => {
    if (step === 0) {
      if (!form.title.trim()) return 'Nama usaha wajib diisi';
      if (!form.description.trim()) return 'Deskripsi wajib diisi';
      if (form.description.length < 50) return 'Deskripsi minimal 50 karakter agar lebih meyakinkan investor';
    }
    if (step === 1) {
      if (!form.target_amount || isNaN(form.target_amount) || parseFloat(form.target_amount) < 1000000) return 'Target modal minimal Rp 1.000.000';
      if (!form.return_rate || isNaN(form.return_rate) || parseFloat(form.return_rate) < 1 || parseFloat(form.return_rate) > 50) return 'Return rate harus antara 1% – 18%';
      if (form.repayment_type === 'cicilan') {
        if (!form.tenor_months || isNaN(form.tenor_months) || parseInt(form.tenor_months) < 1 || parseInt(form.tenor_months) > 60) return 'Tenor harus antara 1 – 15 bulan';
      }
    }
    if (step === 2) {
      if (!form.address.trim()) return 'Alamat usaha wajib diisi';
      if (!form.lat || !form.lng) return 'Koordinat GPS diperlukan. Izinkan akses lokasi atau isi manual.';
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
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        target_amount: parseFloat(form.target_amount),
        return_rate: parseFloat(form.return_rate),
        repayment_type: form.repayment_type,
        tenor_months: form.repayment_type === 'cicilan' ? parseInt(form.tenor_months) : 1,
        address: form.address.trim(),
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        deadline: form.deadline || null,
      };
      await api.post('/campaigns', payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan kampanye. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Style helpers
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: `1px solid ${T.gray200}`,
    borderRadius: 8,
    outline: 'none',
    boxSizing: 'border-box',
    background: T.white,
  };
  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: T.gray700,
    marginBottom: 6,
  };

  //  Kalkulasi preview
  const targetNum = parseFloat(form.target_amount) || 0;
  const rateNum = parseFloat(form.return_rate) || 0;
  const tenorNum = parseInt(form.tenor_months) || 1;
  const totalReturn = targetNum > 0 ? Math.round(targetNum * (1 + rateNum / 100)) : 0;
  const monthlyAmt = form.repayment_type === 'cicilan' && tenorNum > 0 ? Math.round(totalReturn / tenorNum) : 0;

  //  Halaman sukses
  if (success)
    return (
      <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="ff-card" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: 56, marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: '0.75rem' }}>Kampanye Berhasil Diajukan!</h2>
          <p style={{ fontSize: 14, color: T.gray500, lineHeight: 1.7, marginBottom: '2rem' }}>
            Kampanye <strong>{form.title}</strong> sedang menunggu persetujuan admin. Proses verifikasi biasanya 1–3 hari kerja. Kamu akan mendapat notifikasi saat disetujui.
          </p>
          <div style={{ background: T.greenLight, borderRadius: 8, padding: '12px', marginBottom: '1.5rem', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: T.gray700 }}>Target modal</span>
              <span style={{ fontWeight: 600 }}>{rupiah(targetNum)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: T.gray700 }}>Return rate</span>
              <span style={{ fontWeight: 600 }}>{rateNum}% / tahun</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: T.gray700 }}>Jenis pengembalian</span>
              <span style={{ fontWeight: 600 }}>{form.repayment_type === 'cicilan' ? `Cicilan ${tenorNum} bulan` : 'Lunas di akhir'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={onSuccess}
              style={{
                padding: '12px',
                background: T.green,
                color: T.white,
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Lihat Kampanye Saya →
            </button>
            <button className="ff-btn" onClick={onCancel}>
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)', padding: '2rem 0' }}>
      <div className="ff-container" style={{ maxWidth: 700 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button className="ff-btn ff-btn-sm" onClick={onCancel} style={{ marginBottom: '1rem' }}>
            ← Kembali
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Ajukan Kampanye Baru</h1>
          <p style={{ fontSize: 14, color: T.gray500 }}>Isi formulir berikut untuk mendapatkan pendanaan dari investor.</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', marginBottom: '2rem' }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: i <= step ? T.green : T.gray200 }} />}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: i <= step ? T.green : T.gray200,
                    color: i <= step ? T.white : T.gray500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? T.green : T.gray200 }} />}
              </div>
              <div style={{ fontSize: 11, marginTop: 6, color: i === step ? T.green : T.gray500, fontWeight: i === step ? 600 : 400 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="ff-card">
          {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1.25rem' }}>⚠️ {error}</div>}

          {/* ══ STEP 0: INFO USAHA ══ */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 0 }}>Informasi Usaha</h2>

              <div>
                <label style={labelStyle}>
                  Nama Usaha <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input style={inputStyle} type="text" value={form.title} onChange={set('title')} placeholder="Contoh: Warung Makan Bu Siti" />
              </div>

              <div>
                <label style={labelStyle}>
                  Kategori <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select style={inputStyle} value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Deskripsi Usaha <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical' }}
                  rows={6}
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Ceritakan tentang usaha kamu: produk/jasa, sejarah usaha, keunggulan, potensi perkembangan, dan rencana penggunaan dana..."
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: form.description.length < 50 ? '#D97706' : T.green,
                    marginTop: 4,
                  }}
                >
                  <span>{form.description.length < 50 ? `Minimal 50 karakter (kurang ${50 - form.description.length})` : '✓ Deskripsi cukup'}</span>
                  <span>{form.description.length} karakter</span>
                </div>
              </div>
            </div>
          )}

          {/*DETAIL PENDANAAN*/}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 0 }}>Detail Pendanaan</h2>

              {/* Target modal */}
              <div>
                <label style={labelStyle}>
                  Target Modal (Rp) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input style={inputStyle} type="number" min={1000000} step={500000} value={form.target_amount} onChange={set('target_amount')} placeholder="Contoh: 10000000" />
                {form.target_amount && !isNaN(form.target_amount) && <div style={{ fontSize: 12, color: T.green, marginTop: 4 }}>= {rupiah(parseFloat(form.target_amount))}</div>}
              </div>

              {/* Return rate */}
              <div>
                <label style={labelStyle}>
                  Return Rate (%) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input style={inputStyle} type="number" min={1} max={18} step={0.5} value={form.return_rate} onChange={set('return_rate')} placeholder="Contoh: 15" />
                <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>Berapa % dari modal yang akan kamu kembalikan di atas pokok. Range: 1% – 18%</div>
              </div>

              {/*  JENIS PENGEMBALIAN  */}
              <div>
                <label style={labelStyle}>
                  Jenis Pengembalian <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    {
                      val: 'cicilan',
                      icon: '📆',
                      title: 'Cicilan Bulanan',
                      desc: 'Bayar pokok + bunga dicicil setiap bulan selama tenor yang ditentukan.',
                    },
                    {
                      val: 'lunas',
                      icon: '💰',
                      title: 'Lunas di Akhir',
                      desc: 'Bayar semua (pokok + bunga) sekaligus saat tenor berakhir.',
                    },
                  ].map((opt) => {
                    const selected = form.repayment_type === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, repayment_type: opt.val }));
                          setError('');
                        }}
                        style={{
                          padding: '1rem',
                          borderRadius: 10,
                          cursor: 'pointer',
                          textAlign: 'left',
                          border: `2px solid ${selected ? T.green : T.gray200}`,
                          background: selected ? T.greenLight : T.white,
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{opt.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: selected ? T.greenDark : T.gray900, marginBottom: 4 }}>
                          {opt.title}
                          {selected && <span style={{ marginLeft: 6, fontSize: 12, color: T.green }}>✓</span>}
                        </div>
                        <div style={{ fontSize: 12, color: T.gray500, lineHeight: 1.5 }}>{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tenor — hanya muncul jika cicilan */}
              {form.repayment_type === 'cicilan' && (
                <div style={{ animation: 'fadeIn 0.2s' }}>
                  <label style={labelStyle}>
                    Tenor (bulan) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input style={inputStyle} type="number" min={1} max={15} value={form.tenor_months} onChange={set('tenor_months')} placeholder="Contoh: 12" />
                  <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>Durasi cicilan: 1 – 15 bulan</div>
                </div>
              )}

              {/* Deadline */}
              <div>
                <label style={labelStyle}>
                  Deadline Pendanaan <span style={{ color: T.gray500, fontWeight: 400 }}>(opsional)</span>
                </label>
                <input style={inputStyle} type="date" min={new Date().toISOString().split('T')[0]} value={form.deadline} onChange={set('deadline')} />
                <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>Batas waktu kampanye menerima investasi dari investor.</div>
              </div>

              {/* Preview kalkulasi */}
              {targetNum > 0 && rateNum > 0 && (
                <div
                  style={{
                    background: T.greenLight,
                    border: `1px solid ${T.green}30`,
                    borderRadius: 10,
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: T.greenDark, marginBottom: 12, fontSize: 14 }}>📊 Preview Kewajiban ke Investor</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      ['Modal yang dicari', rupiah(targetNum)],
                      [`Return (${rateNum}%)`, rupiah(Math.round((targetNum * rateNum) / 100))],
                      ['Total harus dikembalikan', rupiah(totalReturn)],
                      form.repayment_type === 'cicilan' && tenorNum > 0 ? [`Cicilan per bulan (${tenorNum} bln)`, rupiah(monthlyAmt)] : ['Dibayar', 'Sekaligus di akhir tenor'],
                    ]
                      .filter(Boolean)
                      .map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: T.gray700 }}>{k}</span>
                          <span style={{ fontWeight: 700, color: T.greenDark }}>{v}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOKASI */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 0 }}>Lokasi Usaha</h2>

              <div>
                <label style={labelStyle}>
                  Alamat Lengkap <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.address} onChange={set('address')} placeholder="Contoh: Jl. Sudirman No. 12, Kel. Sukamaju, Kec. Tampan, Pekanbaru, Riau 28291" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>
                    Latitude <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input style={inputStyle} type="number" step="0.000001" value={form.lat} onChange={set('lat')} placeholder="Contoh: 0.507068" />
                </div>
                <div>
                  <label style={labelStyle}>
                    Longitude <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input style={inputStyle} type="number" step="0.000001" value={form.lng} onChange={set('lng')} placeholder="Contoh: 101.447777" />
                </div>
              </div>

              {form.lat && form.lng ? (
                <div style={{ background: T.greenLight, border: `1px solid ${T.green}30`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: T.greenDark }}>
                  ✅ Koordinat GPS terdeteksi: {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}
                </div>
              ) : (
                <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400E' }}>
                  ⚠️ Koordinat belum terisi. Izinkan akses lokasi di browser atau isi manual di atas.
                </div>
              )}
            </div>
          )}

          {/* KONFIRMASI */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 0 }}>Konfirmasi & Ajukan</h2>
              <p style={{ fontSize: 14, color: T.gray500, marginBottom: 4 }}>Periksa kembali sebelum diajukan ke admin untuk diverifikasi.</p>

              {/* Info usaha */}
              <div style={{ background: T.gray50, border: T.border, borderRadius: 8, padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.green, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Info Usaha</div>
                {[
                  ['Nama Usaha', form.title],
                  ['Kategori', form.category],
                  ['Deskripsi', form.description.slice(0, 100) + (form.description.length > 100 ? '...' : '')],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, fontSize: 14, marginBottom: 6 }}>
                    <span style={{ color: T.gray500 }}>{k}</span>
                    <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '65%' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Detail pendanaan */}
              <div style={{ background: T.gray50, border: T.border, borderRadius: 8, padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.green, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pendanaan</div>
                {[
                  ['Target Modal', rupiah(targetNum)],
                  ['Return Rate', `${rateNum}% / tahun`],
                  ['Total Dikembalikan', rupiah(totalReturn)],
                  ['Jenis Pengembalian', form.repayment_type === 'cicilan' ? `Cicilan bulanan (${tenorNum} bln)` : 'Lunas di akhir tenor'],
                  form.repayment_type === 'cicilan' ? ['Cicilan per bulan', rupiah(monthlyAmt)] : ['Bayar sekaligus', rupiah(totalReturn)],
                  ['Deadline', form.deadline ? new Date(form.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tidak ada'],
                ]
                  .filter(Boolean)
                  .map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, fontSize: 14, marginBottom: 6 }}>
                      <span style={{ color: T.gray500 }}>{k}</span>
                      <span style={{ fontWeight: 500, textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
              </div>

              {/* Lokasi */}
              <div style={{ background: T.gray50, border: T.border, borderRadius: 8, padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.green, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lokasi</div>
                {[
                  ['Alamat', form.address],
                  ['Koordinat', `${parseFloat(form.lat).toFixed(4)}, ${parseFloat(form.lng).toFixed(4)}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, fontSize: 14, marginBottom: 6 }}>
                    <span style={{ color: T.gray500 }}>{k}</span>
                    <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '65%' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#92400E' }}>
                ℹ️ Setelah diajukan, kampanye berstatus <strong>pending</strong> hingga admin menyetujui. Kamu tidak bisa mengedit selama proses verifikasi.
              </div>
            </div>
          )}

          {/* Navigasi tombol */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: 10 }}>
            <button className="ff-btn" onClick={step === 0 ? onCancel : handleBack} disabled={loading}>
              {step === 0 ? 'Batal' : '← Sebelumnya'}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                style={{
                  padding: '10px 24px',
                  background: T.green,
                  color: T.white,
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
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
                  padding: '10px 24px',
                  background: T.green,
                  color: T.white,
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
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
