// client/src/pages/UMKMDashboard.jsx
import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import ProgressBar from '../components/ProgressBar';
import { getMyCampaign } from '../services/campaign';
import { getTransactions } from '../services/user';
import { fmt, pct } from '../utils/format';

const SIDEBAR_LINKS = [
  { id: 'overview', icon: '⊡', label: 'Ringkasan' },
  { id: 'campaign', icon: '◈', label: 'Campaign saya' },
  { id: 'txn',      icon: '⊞', label: 'Transaksi' },
];

const MILESTONES = [
  { label: 'Dokumen diserahkan'},
  { label: 'Verifikasi lapangan'},
  { label: 'Campaign tayang'},
  { label: 'Target tercapai'},
  { label: 'Dana dicairkan'},
];

export default function UMKMDashboard({ user, setPage }) {
  const [tab, setTab]                   = useState('overview');
  const [campaign, setCampaign]         = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // Ganti baris useEffect di client/src/pages/UMKMDashboard.jsx dengan ini:

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campRes, txnRes] = await Promise.all([
          getMyCampaign(),
          getTransactions(),
        ]);
        
        const campData = campRes.data?.campaign || campRes.data?.[0] || campRes.data;
        
        // ✅ LOGIKA SAKTI: Jika data dari backend ada tapi dummy (target 0 atau tidak ada nama)
        if (campData && (campData.target === 0 || campData.target_amount === 0 || !campData.name)) {
          setCampaign(null); // Paksa ke tampilan "Belum ada campaign"
        } else {
          setCampaign(campData || null);
        }
        
        const tData = txnRes.data?.transactions || txnRes.data;
        setTransactions(Array.isArray(tData) ? tData : []);
        
      } catch (err) {
        console.error('Gagal fetch data UMKM:', err.message);
        setError('Gagal memuat data campaign. Silakan coba lagi.');
        setTransactions([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 56px)' }}>
      <p style={{ color: T.gray500 }}>Memuat dashboard...</p>
    </div>
  );

  const progress = campaign ? pct(campaign.raised || campaign.current_amount || 0, campaign.target || campaign.target_amount || 1) : 0;
  
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  // ── POTONGAN UI (KOMPONEN INTERNAL) ── //
  
  const renderEmptyState = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, flexDirection: 'column', gap: '1rem', background: T.white, borderRadius: 12, border: `1px solid ${T.gray200}` }}>
      <div style={{ fontSize: 48 }}>🏪</div>
      <h2 style={{ fontWeight: 600 }}>Belum ada campaign</h2>
      <p style={{ color: T.gray500, fontSize: 14 }}>Ajukan campaign baru untuk mulai mencari pendanaan.</p>
      <button className="ff-btn ff-btn-primary" onClick={() => setPage('createCampaign')}>Ajukan Campaign</button>
    </div>
  );

  const renderCampaignStats = () => (
    <div className="ff-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>{campaign.name}</h3>
          <p style={{ fontSize: 13, color: T.gray500, marginTop: 2 }}>{campaign.desc || campaign.description}</p>
        </div>
        <span className="ff-badge ff-badge-green">
          {campaign.status === 'active' ? 'Campaign Aktif' : campaign.status || 'Aktif'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 12, marginBottom: '1.25rem' }}>
        {[
          ['Dana terkumpul', fmt(campaign.raised || campaign.current_amount || 0)],
          ['Target',         fmt(campaign.target || campaign.target_amount || 0)],
          ['Investor',       `${campaign.investors || campaign.investor_count || 0} orang`],
          ['Sisa waktu',     campaign.days_left ? `${campaign.days_left} hari` : '—'],
        ].map(([k, v]) => (
          <div key={k} style={{ padding: 12, background: T.gray50, borderRadius: 8, border: `1px solid ${T.gray200}` }}>
            <div style={{ fontSize: 11, color: T.gray500, marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>

      <ProgressBar value={progress} height={8} showLabel label="Progress pendanaan" />
    </div>
  );

  const renderMilestones = () => (
    <div className="ff-card" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Tahapan proses</h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {MILESTONES.map((m, i) => (
          <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < MILESTONES.length - 1 ? `1px solid ${T.gray100}` : 'none' }}>
            <div style={{ 
              width: 24, height: 24, borderRadius: '50%', 
              background: T.gray200,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
            }}>
              <span style={{ color: T.gray500, fontSize: 11 }}>{i + 1}</span>
            </div>
            <span style={{ fontSize: 14, color: T.gray500, fontWeight: 400 }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransactions = (limit = null) => {
    const displayTxns = limit ? transactions.slice(0, limit) : transactions;
    return (
      <div className="ff-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 600 }}>{limit ? 'Dana masuk terbaru' : 'Riwayat Transaksi'}</h3>
          {limit && transactions.length > limit && (
            <button className="ff-btn ff-btn-sm" onClick={() => setTab('txn')}>Lihat semua</button>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="ff-table">
            <thead>
              <tr><th>Tanggal</th><th>Keterangan</th><th>Jumlah</th><th>Jenis</th></tr>
            </thead>
            <tbody>
              {displayTxns.length === 0
                ? <tr><td colSpan={4} style={{ textAlign: 'center', color: T.gray500, padding: '2rem' }}>Belum ada transaksi.</td></tr>
                : displayTxns.map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13, color: T.gray500 }}>
                      {t.date ? new Date(t.date).toLocaleDateString('id-ID') : new Date(t.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td style={{ fontWeight: 500 }}>{t.investor_name || t.investor || t.description || '—'}</td>
                    <td style={{ fontWeight: 600, color: T.green }}>+{fmt(t.amount)}</td>
                    <td>
                      <span className={`ff-badge ${t.type === 'Masuk' || t.type === 'investment' ? 'ff-badge-green' : 'ff-badge-amber'}`}>
                        {t.type === 'investment' ? 'Masuk' : t.type || 'Masuk'}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
      {/* Sidebar Kiri */}
      <aside style={{ width: 240, borderRight: `1px solid ${T.gray200}`, padding: '1.5rem 1rem', background: T.white }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: T.green, marginBottom: '0.5rem' }}>
            {initials}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name || '—'}</div>
          <div style={{ fontSize: 12, color: T.gray500, marginBottom: 6 }}>
            {user?.email || 'Pemilik UMKM'}
          </div>
          <span className="ff-badge ff-badge-green">
            {campaign?.sector || campaign?.category || 'UMKM'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SIDEBAR_LINKS.map((l) => {
            const isActive = tab === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setTab(l.id)}
                style={{
                  display: 'flex', alignItems: 'center', width: '100%', padding: '10px 12px',
                  borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: isActive ? T.greenLight : 'transparent',
                  color: isActive ? T.greenDark : T.gray700,
                  fontWeight: isActive ? 600 : 500,
                  transition: 'background 0.2s',
                }}
              >
                <span style={{ marginRight: 10, fontSize: 16, color: isActive ? T.green : T.gray500 }}>{l.icon}</span>
                {l.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Konten Utama Kanan */}
      <main style={{ flex: 1, padding: '2rem', background: T.gray50, overflow: 'auto' }}>
        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* --- TAB: RINGKASAN --- */}
        {tab === 'overview' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 22, fontWeight: 600 }}>Ringkasan Dashboard</h2>
              <p style={{ fontSize: 14, color: T.gray500 }}>Pantau sekilas perkembangan pendanaan UMKM Anda.</p>
            </div>
            {!campaign && !error ? renderEmptyState() : (
              <>
                {renderCampaignStats()}
                {renderTransactions(3)}
              </>
            )}
          </>
        )}

        {/* --- TAB: CAMPAIGN SAYA --- */}
        {tab === 'campaign' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 22, fontWeight: 600 }}>Campaign Saya</h2>
              <p style={{ fontSize: 14, color: T.gray500 }}>Kelola dan pantau tahapan verifikasi serta progress campaign Anda.</p>
            </div>
            {!campaign && !error ? renderEmptyState() : (
              <>
                {renderCampaignStats()}
                {renderMilestones()}
              </>
            )}
          </>
        )}

        {/* --- TAB: TRANSAKSI --- */}
        {tab === 'txn' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 22, fontWeight: 600 }}>Riwayat Transaksi</h2>
              <p style={{ fontSize: 14, color: T.gray500 }}>Rincian seluruh dana masuk dari para investor ke campaign Anda.</p>
            </div>
            {renderTransactions()}
          </>
        )}
      </main>
    </div>
  );
}