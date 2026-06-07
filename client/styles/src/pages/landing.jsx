import { T } from '../../tokens';
import CampaignCard from '../../src/components/CampaignCard';
import { useState, useEffect } from 'react';
import { getCampaigns } from '../services/campaign';

const STATS = [
  { num: 'Rp 12,4M', label: 'Total Disalurkan' },
  { num: '1.847', label: 'Investor Aktif' },
  { num: '312', label: 'UMKM Didanai' },
  { num: '14,2%', label: 'Rata-rata Return' },
];
const HOW_IT_WORKS = [
  { n: '01', title: 'Daftar akun', desc: 'Verifikasi KTP dan rekening bank kamu dalam 5 menit.' },
  { n: '02', title: 'Pilih campaign', desc: 'Browse UMKM yang sudah terverifikasi tim kami.' },
  { n: '03', title: 'Mulai dari Rp 100 rb', desc: 'Investasikan dana sesuai kemampuan, diversifikasi portfolio.' },
  { n: '04', title: 'Terima return', desc: 'Imbal hasil dikirim langsung ke rekening tiap bulan.' },
];

const SECTORS = ['Kuliner', 'Fashion', 'Agrikultur', 'Kerajinan', 'Perikanan', 'Teknologi'];
function normalizeCampaign(c) {
  return {
    ...c,
    name: c.name || c.title || '—',
    sector: c.sector || c.category || '—',
    raised: parseFloat(c.raised ?? c.collected_amount ?? 0),
    target: parseFloat(c.target ?? c.target_amount ?? 1),
    return: c.return ?? (c.return_rate != null ? `${c.return_rate}%` : '—'),
    tenor: c.tenor ?? (c.tenor_months != null ? `${c.tenor_months} bln` : '—'),
    investors: c.investors ?? c.investor_count ?? 0,
    desc: c.desc || c.description || '',
    img: c.img || c.icon || '🏪',
    risk: c.risk || c.risk_level || '—',
    location: c.location || c.address || '—',
  };
}
export default function Landing({ role, setPage }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCampaigns()
      .then(({ data }) => {
        const raw = data.campaigns || [];
        // Gunakan .map() untuk menyaring data mentah menjadi format yang benar
        setCampaigns(raw.map(normalizeCampaign));
      })
      .catch((err) => console.error('Gagal fetch kampanye:', err.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div>
      {/* HERO */}
      <section style={{ background: T.white, borderBottom: T.border, padding: '5rem 0 4rem' }}>
        <div className="ff-container">
          <div style={{ maxWidth: 620 }}>
            <div className="ff-badge ff-badge-green" style={{ marginBottom: '1.25rem' }}>
              ✦ Platform investasi UMKM #1 Indonesia
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 600, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              Danai UMKM lokal,
              <br />
              <span style={{ color: T.green }}>tumbuh bersama.</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: T.gray500, lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
              Investasikan dana kamu ke ratusan UMKM terpilih di seluruh Indonesia. Mulai dari Rp 100.000, dapatkan return hingga 18% per tahun.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {role === 'investor' ? (
                // Tombol khusus jika yang login adalah Investor
                <>
                  <button className="ff-btn ff-btn-primary" style={{ padding: '10px 24px', fontSize: 15 }} onClick={() => setPage('campaign')}>
                    Lihat Campaign →
                  </button>
                  <button className="ff-btn" style={{ padding: '10px 24px', fontSize: 15 }} onClick={() => setPage('investor')}>
                    Dashboard Portofolio
                  </button>
                </>
              ) : (
                // Tombol khusus jika yang login adalah UMKM
                <>
                  <button className="ff-btn ff-btn-primary" style={{ padding: '10px 24px', fontSize: 15 }} onClick={() => setPage('umkm')}>
                    Kelola Campaign UMKM →
                  </button>
                  <button className="ff-btn" style={{ padding: '10px 24px', fontSize: 15 }} onClick={() => setPage('campaign')}>
                    Jelajahi Campaign Lain
                  </button>
                </>
              )}
            </div>
            <p style={{ fontSize: 12, color: T.gray500, marginTop: 12 }}>Terdaftar &amp; diawasi OJK · Nomor izin: KEP-0012/OJK/2023</p>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section style={{ background: T.gray900, padding: '2.5rem 0' }}>
        <div className="ff-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2rem', textAlign: 'center' }}>
            {STATS.map((s) => (
              <div key={s.num}>
                <div style={{ fontSize: 28, fontWeight: 600, color: T.white }}>{s.num}</div>
                <div style={{ fontSize: 13, color: '#8a8880', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAMPAIGN PREVIEW */}
      <section className="ff-section" style={{ background: T.gray50 }}>
        <div className="ff-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>Campaign aktif sekarang</h2>
              <p style={{ color: T.gray500, marginTop: 4, fontSize: 14 }}>Semua UMKM telah melalui proses verifikasi tim lapangan kami.</p>
            </div>
            <button className="ff-btn ff-btn-sm" onClick={() => setPage('campaigns')}>
              Lihat semua →
            </button>
          </div>

          {/* Loading */}
          {loading && <p style={{ textAlign: 'center', color: T.gray500, padding: '2rem' }}>Memuat kampanye...</p>}

          {/* Tidak ada kampanye */}
          {!loading && campaigns.length === 0 && <p style={{ textAlign: 'center', color: T.gray500, padding: '2rem' }}>Belum ada kampanye aktif saat ini.</p>}

          {/* ✅ Data dari database */}
          {!loading && campaigns.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1rem' }}>
              {campaigns.slice(0, 3).map((c) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  onClick={() => {
                    localStorage.setItem('selectedCampaignId', c.id);
                    setPage('campaign-detail');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="ff-section" style={{ background: T.white, borderTop: T.border, borderBottom: T.border }}>
        <div className="ff-container">
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>Cara kerja FolkFund</h2>
            <p style={{ color: T.gray500, marginTop: 6, fontSize: 14 }}>Sederhana, transparan, dan aman.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '2rem' }}>
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n} style={{ borderTop: `2px solid ${T.green}`, paddingTop: '1.25rem' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: T.green, marginBottom: '0.75rem' }}>{s.n}</div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: '0.5rem' }}>{s.title}</div>
                <div style={{ fontSize: 14, color: T.gray500, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section style={{ padding: '3rem 0', background: T.gray50 }}>
        <div className="ff-container">
          <p style={{ fontSize: 12, color: T.gray500, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Sektor yang didukung</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SECTORS.map((s) => (
              <span key={s} style={{ padding: '6px 14px', border: T.border, borderRadius: 20, fontSize: 14, color: T.gray700, background: T.white }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: T.border, padding: '2rem 0', background: T.white }}>
        <div className="ff-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div className="ff-nav-logo">
            <img src="/Folk Fund.png" alt="FolkFund Logo" style={{ height: '24px', objectFit: 'contain' }} />
          </div>
        </div>
      </footer>
    </div>
  );
}
