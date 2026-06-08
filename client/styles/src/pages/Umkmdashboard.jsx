// client/styles/src/pages/Umkmdashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../../tokens';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { getMyCampaign } from '../services/campaign';
import { getTransactions } from '../services/user';
import { fmt, pct } from '../utils/format';

const SIDEBAR_LINKS = [
  { id: 'overview',  icon: '⊡', label: 'Ringkasan' },
  { id: 'campaign',  icon: '◈', label: 'Campaign saya' },
  { id: 'txn',       icon: '⊞', label: 'Transaksi' },
];

const MILESTONES = [
  { label: 'Dokumen diserahkan' },
  { label: 'Verifikasi lapangan' },
  { label: 'Campaign tayang' },
  { label: 'Target tercapai' },
  { label: 'Dana dicairkan' },
];

function LoadingRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map((i) => (
        <td key={i}>
          <div style={{ height: 14, background: T.gray100, borderRadius: 4, width: '80%' }} />
        </td>
      ))}
    </tr>
  );
}

function EmptyState({ navigate }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: 350, flexDirection: 'column', gap: '1rem',
      background: T.white, borderRadius: 12,
      border: `1px solid ${T.gray200}`, padding: '2rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: 48 }}>🏪</div>
      <h2 style={{ fontWeight: 600, fontSize: 18, margin: 0 }}>Belum ada campaign</h2>
      <p style={{ color: T.gray500, fontSize: 14, maxWidth: 300, margin: 0 }}>
        Ajukan campaign baru untuk mulai mencari pendanaan dari investor.
      </p>
      <button className="ff-btn ff-btn-primary" onClick={() => navigate('/create-campaign')}>
        + Ajukan Campaign
      </button>
    </div>
  );
}

function Overview({ user, campaign, transactions, loading, navigate }) {
  const targetVal = campaign ? parseFloat(campaign.target_amount || 0) : 0;
  const raisedVal = campaign ? parseFloat(campaign.collected_amount || campaign.raised || 0) : 0;
  const progress  = campaign ? pct(raisedVal, targetVal > 0 ? targetVal : 1) : 0;
  const investors = campaign?.investor_count || campaign?.investors || 0;

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>
          Selamat datang, {user?.name?.split(' ')[0] || 'Pemilik'} 👋
        </h2>
        <p style={{ fontSize: 14, color: T.gray500, margin: 0 }}>
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {!campaign ? (
        <EmptyState navigate={navigate} />
      ) : (
        <>
          <div className="ff-grid-4" style={{ marginBottom: '1.5rem' }}>
            <StatCard label="Dana Terkumpul"  value={fmt(raisedVal)} accent />
            <StatCard label="Target Campaign" value={fmt(targetVal)} />
            <StatCard label="Jumlah Investor" value={`${investors} orang`} />
            <StatCard label="Progress"        value={`${progress}%`} />
          </div>

          {/* Card campaign utama */}
          <div className="ff-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 17, margin: '0 0 4px' }}>
                  {campaign.title || campaign.name || '—'}
                </h3>
                <p style={{ fontSize: 13, color: T.gray500, margin: 0 }}>
                  {campaign.category || campaign.sector || '—'} · {campaign.location || '—'}
                </p>
              </div>
              <span className={`ff-badge ${campaign.status === 'active' ? 'ff-badge-green' : 'ff-badge-gray'}`}>
                {campaign.status === 'active' ? 'Aktif' : campaign.status === 'pending' ? 'Menunggu' : campaign.status || '—'}
              </span>
            </div>
            <ProgressBar value={progress} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13, color: T.gray500 }}>
              <span>{fmt(raisedVal)} terkumpul</span>
              <span>Target {fmt(targetVal)}</span>
            </div>
          </div>

          {/* Milestone */}
          <div className="ff-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: 15 }}>Tahapan Campaign</h3>
            <div style={{ display: 'flex', gap: 0 }}>
              {MILESTONES.map((m, i) => {
                const done = i <= (progress >= 100 ? 4 : progress > 0 ? 2 : 0);
                return (
                  <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                    {i < MILESTONES.length - 1 && (
                      <div style={{
                        position: 'absolute', top: 12, left: '50%', width: '100%',
                        height: 2, background: done ? T.green : T.gray200, zIndex: 0,
                      }} />
                    )}
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', margin: '0 auto 8px',
                      background: done ? T.green : T.gray200,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: done ? T.white : T.gray500,
                      position: 'relative', zIndex: 1, fontWeight: 700,
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div style={{ fontSize: 11, color: done ? T.greenDark : T.gray500, lineHeight: 1.3 }}>{m.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transaksi terbaru */}
          <div className="ff-card">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: 15 }}>Investasi Terbaru</h3>
            {Array.isArray(transactions) && transactions.length > 0 ? (
              transactions.slice(0, 3).map((t, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: i < 2 ? `1px solid ${T.gray100}` : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{t.investor_name || t.name || 'Investor'}</div>
                    <div style={{ fontSize: 12, color: T.gray500 }}>
                      {t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '—'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: T.green }}>{fmt(parseFloat(t.amount) || 0)}</div>
                </div>
              ))
            ) : (
              <p style={{ color: T.gray500, fontSize: 14, textAlign: 'center' }}>Belum ada investasi masuk.</p>
            )}
          </div>
        </>
      )}
    </>
  );
}

function CampaignTab({ campaign, loading, navigate }) {
  if (loading) return <p style={{ color: T.gray500 }}>Memuat data campaign...</p>;
  if (!campaign) return <EmptyState navigate={navigate} />;

  const targetVal = parseFloat(campaign.target_amount || 0);
  const raisedVal = parseFloat(campaign.collected_amount || campaign.raised || 0);
  const progress  = pct(raisedVal, targetVal > 0 ? targetVal : 1);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Campaign Saya</h2>
        <button className="ff-btn ff-btn-sm" onClick={() => navigate('/create-campaign')}>
          + Campaign Baru
        </button>
      </div>

      <div className="ff-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 18, margin: '0 0 6px' }}>{campaign.title || campaign.name}</h3>
            <p style={{ color: T.gray500, fontSize: 13, margin: 0 }}>{campaign.description || '—'}</p>
          </div>
          <span className={`ff-badge ${campaign.status === 'active' ? 'ff-badge-green' : 'ff-badge-gray'}`}>
            {campaign.status === 'active' ? 'Aktif' : campaign.status === 'pending' ? 'Menunggu Verifikasi' : campaign.status || '—'}
          </span>
        </div>

        <div className="ff-grid-2" style={{ marginBottom: '1.5rem' }}>
          <StatCard label="Dana Terkumpul"  value={fmt(raisedVal)} accent />
          <StatCard label="Target"          value={fmt(targetVal)} />
        </div>

        <ProgressBar value={progress} />
        <div style={{ textAlign: 'right', marginTop: 6, fontSize: 13, color: T.gray500 }}>
          {progress}% tercapai
        </div>

        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { label: 'Kategori',   value: campaign.category || campaign.sector || '—' },
            { label: 'Lokasi',     value: campaign.location || '—' },
            { label: 'Return/th',  value: campaign.return_rate != null ? `${campaign.return_rate}%` : '—' },
            { label: 'Tenor',      value: campaign.tenor_months != null ? `${campaign.tenor_months} bulan` : '—' },
            { label: 'Investor',   value: `${campaign.investor_count || 0} orang` },
            { label: 'Dibuat',     value: campaign.created_at ? new Date(campaign.created_at).toLocaleDateString('id-ID') : '—' },
          ].map((item) => (
            <div key={item.label} style={{ padding: '12px', background: T.gray50, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: T.gray500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.gray900 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TransaksiTab({ transactions, loading }) {
  const safe = Array.isArray(transactions) ? transactions : [];
  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: '1.5rem' }}>Riwayat Transaksi</h2>
      <div className="ff-card" style={{ overflowX: 'auto' }}>
        <table className="ff-table">
          <thead>
            <tr>
              <th>Tanggal</th><th>Investor</th><th>Jumlah</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1, 2, 3].map((i) => <LoadingRow key={i} />)
              : safe.length === 0
                ? <tr><td colSpan={4} style={{ textAlign: 'center', color: T.gray500, padding: '2rem' }}>Belum ada transaksi.</td></tr>
                : safe.map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13, color: T.gray500 }}>
                      {t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '—'}
                    </td>
                    <td style={{ fontWeight: 500 }}>{t.investor_name || t.name || 'Investor'}</td>
                    <td style={{ fontWeight: 600, color: T.green }}>{fmt(parseFloat(t.amount) || 0)}</td>
                    <td><span className="ff-badge ff-badge-green">Berhasil</span></td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function UMKMDashboard({ user }) {
  const navigate = useNavigate();
  const [tab, setTab]               = useState('overview');
  const [campaign, setCampaign]     = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [isMobile, setIsMobile]     = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campRes, txnRes] = await Promise.all([getMyCampaign(), getTransactions()]);

        // Normalisasi data campaign
        const campList = campRes.data?.campaigns || campRes.data;
        let campData = null;
        if (Array.isArray(campList) && campList.length > 0) {
          campData = campList[0];
        } else if (campList && !Array.isArray(campList) && Object.keys(campList).length > 0) {
          campData = campList;
        }
        if (campData && (!campData.title || parseFloat(campData.target_amount) === 0)) {
          campData = null;
        }
        setCampaign(campData);

        // Normalisasi transaksi
        const tData = txnRes.data?.transactions || txnRes.data?.investments || txnRes.data;
        setTransactions(Array.isArray(tData) ? tData : []);
      } catch (err) {
        console.error('Gagal fetch data UMKM:', err.message);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const saldoFooter = (
    <div style={{ padding: 12, background: T.greenLight, borderRadius: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.green, marginBottom: 4 }}>Akun</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.greenDark }}>{user?.name || '—'}</div>
      <div style={{ fontSize: 11, color: T.gray500, marginTop: 2 }}>{user?.email || '—'}</div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 56px)' }}>
        <p style={{ color: T.gray500 }}>Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)', position: 'relative', flexDirection: isMobile ? 'column' : 'row' }}>

      {/* Tombol Terapung Mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpenMobileMenu(!isOpenMobileMenu)}
          style={{
            position: 'fixed', bottom: 20, right: 20, zIndex: 10000,
            background: T.green, color: T.white, border: 'none',
            padding: '12px 24px', borderRadius: 30, fontWeight: 600, fontSize: 14,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          {isOpenMobileMenu ? '✕ Tutup Menu' : '📋 Menu Dashboard'}
        </button>
      )}

      {/* Sidebar */}
      <div style={{
        width: isMobile ? '100%' : 240,
        borderRight: isMobile ? 'none' : `1px solid ${T.gray200}`,
        padding: '1.5rem 1rem',
        background: T.white,
        display: isMobile ? (isOpenMobileMenu ? 'flex' : 'none') : 'flex',
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'sticky',
        top: '56px', left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        height: isMobile ? 'calc(100vh - 56px)' : 'auto',
        overflowY: 'auto',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: T.greenLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: T.green, marginBottom: '0.5rem',
          }}>
            {initials}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, color: T.gray900 }}>{user?.name || '—'}</div>
          <div style={{ fontSize: 12, color: T.gray500 }}>Pemilik UMKM</div>
        </div>

        {!isMobile ? (
          <Sidebar links={SIDEBAR_LINKS} activeTab={tab} setTab={setTab} footer={saldoFooter} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
            {SIDEBAR_LINKS.map((link) => {
              const isActive = tab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => { setTab(link.id); setIsOpenMobileMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', width: '100%',
                    padding: '12px 14px', borderRadius: 8, border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    background: isActive ? T.greenLight : 'transparent',
                    color: isActive ? T.greenDark : T.gray700,
                    fontWeight: isActive ? 600 : 500, fontSize: 14,
                  }}
                >
                  <span style={{ marginRight: 12, fontSize: 18, color: isActive ? T.green : T.gray500 }}>{link.icon}</span>
                  {link.label}
                </button>
              );
            })}
            <div style={{ marginTop: '2rem' }}>{saldoFooter}</div>
          </div>
        )}
      </div>

      {/* Konten Utama */}
      <main style={{
        flex: 1, padding: isMobile ? '1rem' : '2rem',
        background: T.gray50, overflow: 'auto', width: '100%',
      }}>
        {tab === 'overview' && <Overview user={user} campaign={campaign} transactions={transactions} loading={loading} navigate={navigate} />}
        {tab === 'campaign' && <CampaignTab campaign={campaign} loading={loading} navigate={navigate} />}
        {tab === 'txn'      && <TransaksiTab transactions={transactions} loading={loading} />}
      </main>
    </div>
  );
}