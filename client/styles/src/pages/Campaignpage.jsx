// client/src/pages/CampaignPage.jsx
import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import CampaignCard from '../components/CampaignCard';
import ProgressBar from '../components/ProgressBar';
import { getCampaigns, getCampaignById, investCampaign } from '../services/campaign';
import { fmt, pct } from '../utils/format';

const SECTOR_FILTERS = ['Semua', 'Kuliner', 'Fashion', 'Agrikultur', 'Kerajinan', 'Perikanan'];

function CampaignDetail({ c, onBack, role }) {
  const [amount, setAmount]   = useState(500000);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const progress = pct(c.raised || c.current_amount || 0, c.target || c.target_amount || 1);

  const handleInvest = async () => {
    if (!amount || amount < 100000) return setMessage('Minimum investasi Rp 100.000');
    setLoading(true);
    setMessage('');
    try {
      await investCampaign(c.id, amount);
      setMessage('✅ Investasi berhasil! Dana sedang diproses.');
    } catch (err) {
      const msg = err.response?.data?.message;
      setMessage(`⚠️ ${msg || 'Investasi gagal. Coba lagi.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)' }}>
      <div className="ff-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <button className="ff-btn ff-btn-sm" style={{ marginBottom: '1.5rem' }} onClick={onBack}>← Kembali</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          {/* Kiri */}
          <div>
            <div style={{ background: T.white, border: `1px solid ${T.gray200}`, borderRadius: 8, padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: 48 }}>{c.img || c.icon || '🏪'}</div>
                <div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span className="ff-badge ff-badge-gray">{c.sector || c.category}</span>
                    {c.verified && <span className="ff-badge ff-badge-blue">✓ Terverifikasi</span>}
                  </div>
                  <h1 style={{ fontSize: 22, fontWeight: 700 }}>{c.name}</h1>
                  <p style={{ color: T.gray500, fontSize: 14 }}>📍 {c.location}</p>
                </div>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: T.gray700 }}>
                {c.desc || c.description}
              </p>
            </div>

            {/* Penggunaan dana */}
            <div className="ff-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Penggunaan dana</h3>
              {(c.fund_usage || [
                { label: 'Alat produksi', pct: 50 },
                { label: 'Modal kerja',   pct: 30 },
                { label: 'Biaya operasional', pct: 20 },
              ]).map((item) => (
                <div key={item.label} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.pct}%</span>
                  </div>
                  <ProgressBar value={item.pct} />
                </div>
              ))}
            </div>

            {/* Profil pemilik */}
            <div className="ff-card">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Profil pemilik</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: T.green }}>
                  {(c.owner_name || c.owner || 'P')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.owner_name || c.owner || 'Pemilik Usaha'}</div>
                  <div style={{ fontSize: 13, color: T.gray500 }}>Pemilik usaha</div>
                </div>
              </div>
            </div>
          </div>

          {/* Kanan: panel investasi */}
          <div>
            <div className="ff-card" style={{ position: 'sticky', top: 72 }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 700 }}>{fmt(c.raised || c.current_amount || 0)}</span>
                  <span style={{ fontSize: 13, color: T.green, fontWeight: 600 }}>{progress}%</span>
                </div>
                <div style={{ fontSize: 13, color: T.gray500, marginBottom: 8 }}>dari target {fmt(c.target || c.target_amount || 0)}</div>
                <ProgressBar value={progress} height={8} />
              </div>

              <div style={{ height: 1, background: T.gray200, margin: '1rem 0' }} />

              {[
                ['Return',   `${c.return || c.return_rate || '—'}/tahun`],
                ['Tenor',    c.tenor || '—'],
                ['Risiko',   c.risk  || c.risk_level || '—'],
                ['Investor', `${c.investors || c.investor_count || 0} orang`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: T.gray500 }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}

              <div style={{ height: 1, background: T.gray200, margin: '1rem 0' }} />

              {/* Hanya investor yang bisa investasi */}
              {role === 'investor' ? (
                <>
                  <label className="ff-label">Jumlah investasi (Rp)</label>
                  <input
                    className="ff-input"
                    type="number"
                    value={amount}
                    min={100000}
                    step={50000}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    style={{ marginBottom: '0.75rem' }}
                  />
                  {message && (
                    <div style={{
                      fontSize: 13, padding: '8px 10px', borderRadius: 6, marginBottom: '0.75rem',
                      background: message.startsWith('✅') ? '#D1FAE5' : '#FEE2E2',
                      color: message.startsWith('✅') ? '#065F46' : '#B91C1C',
                    }}>
                      {message}
                    </div>
                  )}
                  <button
                    className="ff-btn ff-btn-primary"
                    style={{ width: '100%', padding: 10, fontSize: 15, opacity: loading ? 0.7 : 1 }}
                    onClick={handleInvest}
                    disabled={loading}
                  >
                    {loading ? 'Memproses...' : 'Investasi Sekarang'}
                  </button>
                  <p style={{ fontSize: 12, color: T.gray500, textAlign: 'center', marginTop: 8 }}>
                    Minimum Rp 100.000 · Dana aman &amp; terlindungi
                  </p>
                </>
              ) : (
                <div style={{ fontSize: 13, color: T.gray500, textAlign: 'center', padding: '0.5rem 0' }}>
                  Login sebagai investor untuk berinvestasi.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignPage({ role }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filter, setFilter]       = useState('Semua');
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await getCampaigns();
        setCampaigns(res.data?.campaigns || res.data || []);
      } catch (err) {
        setError('Gagal memuat campaign. Periksa koneksi Anda.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (selected) {
    return <CampaignDetail c={selected} onBack={() => setSelected(null)} role={role} />;
  }

  const filtered = filter === 'Semua'
    ? campaigns
    : campaigns.filter((c) => (c.sector || c.category) === filter);

  return (
    <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ background: T.white, borderBottom: `1px solid ${T.gray200}`, padding: '2rem 0' }}>
        <div className="ff-container">
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Campaign UMKM</h1>
          <p style={{ color: T.gray500, fontSize: 14 }}>
            {loading ? 'Memuat...' : `${campaigns.length} campaign aktif · semua telah diverifikasi tim lapangan`}
          </p>
          <div style={{ display: 'flex', gap: 6, marginTop: '1.25rem', flexWrap: 'wrap' }}>
            {SECTOR_FILTERS.map((s) => (
              <button
                key={s}
                className="ff-btn ff-btn-sm"
                style={{
                  background: filter === s ? T.green : T.white,
                  color: filter === s ? T.white : T.gray700,
                  borderColor: filter === s ? T.green : T.gray300,
                }}
                onClick={() => setFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ff-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1rem' }}>
            {[1,2,3].map(i => (
              <div key={i} className="ff-card" style={{ height: 280, background: T.gray100, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1rem' }}>
            {filtered.map((c) => (
              <CampaignCard key={c.id} c={c} onClick={() => setSelected(c)} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: T.gray500 }}>
            Belum ada campaign di sektor ini.
          </div>
        )}
      </div>
    </div>
  );
}