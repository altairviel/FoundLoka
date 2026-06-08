// client/src/pages/InvestorDashboard.jsx
import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { getPortfolio } from '../services/user';
import { fmt } from '../utils/format';

const SIDEBAR_LINKS = [
  { id: 'overview',  icon: '⊡', label: 'Ringkasan' },
  { id: 'portfolio', icon: '◈', label: 'Portfolio' },
  { id: 'txn',       icon: '⊞', label: 'Transaksi' },
];

function LoadingRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i}>
          <div style={{ height: 14, background: T.gray100, borderRadius: 4, width: '80%' }} />
        </td>
      ))}
    </tr>
  );
}

function normalizeInvestment(inv) {
  return {
    ...inv,
    campaign_name:   inv.campaign_name || inv.title || '—',
    amount:          parseFloat(inv.amount) || 0,
    return_rate:     inv.return_rate != null ? `${inv.return_rate}%` : '—',
    return_received: parseFloat(inv.return_received) || 0,
    status:          inv.campaign_status === 'active' ? 'active'
                   : inv.campaign_status === 'funded' ? 'funded'
                   : inv.status || inv.campaign_status || '—',
    next_payout:     inv.next_payout || '—',
    type:            inv.type || 'Investasi',
    date:            inv.created_at,
  };
}

function Overview({ user, portfolio, transactions, loadingPortfolio, setTab }) {
  const safePortfolio    = Array.isArray(portfolio)    ? portfolio    : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const totalInvested = safePortfolio.reduce((a, b) => a + (b.amount || 0), 0);
  const totalReturn   = safePortfolio.reduce((a, b) => a + (b.return_received || 0), 0);
  const activeCount   = safePortfolio.filter((p) => p.status === 'active').length;

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>
          Selamat datang, {user?.name?.split(' ')[0] || 'Investor'} 👋
        </h2>
        <p style={{ fontSize: 14, color: T.gray500 }}>
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="ff-grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="Total Diinvestasikan" value={fmt(totalInvested)} />
        <StatCard label="Total Return" value={fmt(totalReturn)} accent />
        <StatCard label="Portfolio Aktif" value={`${activeCount} campaign`} />
        <StatCard
          label="ROI Keseluruhan"
          value={totalInvested > 0 ? `${((totalReturn / totalInvested) * 100).toFixed(1)}%` : '0%'}
        />
      </div>

      <div className="ff-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 600 }}>Portfolio aktif</h3>
          <button className="ff-btn ff-btn-sm" onClick={() => setTab('portfolio')}>Lihat semua</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="ff-table">
            <thead>
              <tr>
                <th>Campaign</th><th>Modal</th><th>Return</th><th>Status</th><th>Payout berikutnya</th>
              </tr>
            </thead>
            <tbody>
              {loadingPortfolio
                ? [1, 2, 3].map((i) => <LoadingRow key={i} />)
                : safePortfolio.length === 0
                  ? <tr><td colSpan={5} style={{ textAlign: 'center', color: T.gray500, padding: '2rem' }}>Belum ada investasi aktif.</td></tr>
                  : safePortfolio.slice(0, 5).map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{p.campaign_name}</td>
                      <td>{fmt(p.amount)}</td>
                      <td><span style={{ color: T.green, fontWeight: 500 }}>{p.return_rate}</span></td>
                      <td>
                        <span className={`ff-badge ${p.status === 'active' ? 'ff-badge-green' : 'ff-badge-gray'}`}>
                          {p.status === 'active' ? 'Aktif' : p.status === 'funded' ? 'Terdanai' : p.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: T.gray500 }}>{p.next_payout}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <div className="ff-card">
        <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Transaksi terbaru</h3>
        {safeTransactions.slice(0, 3).map((t, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? `1px solid ${T.gray100}` : 'none' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{t.campaign_name}</div>
              <div style={{ fontSize: 12, color: T.gray500 }}>
                {t.date ? new Date(t.date).toLocaleDateString('id-ID') : '—'}
                {' · '}{t.type}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.gray900 }}>
                −{fmt(t.amount)}
              </div>
              <span className="ff-badge ff-badge-green" style={{ fontSize: 11 }}>Berhasil</span>
            </div>
          </div>
        ))}
        {safeTransactions.length === 0 && !loadingPortfolio && (
          <p style={{ color: T.gray500, fontSize: 14, textAlign: 'center', padding: '1rem' }}>Belum ada transaksi.</p>
        )}
      </div>
    </>
  );
}

function PortfolioTab({ portfolio, loading }) {
  const safePortfolio = Array.isArray(portfolio) ? portfolio : [];
  const totalInvested = safePortfolio.reduce((a, b) => a + (b.amount || 0), 0);
  const totalReturn   = safePortfolio.reduce((a, b) => a + (b.return_received || 0), 0);
  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: '1.5rem' }}>Portfolio saya</h2>
      <div className="ff-grid-2" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="Total investasi" value={fmt(totalInvested)} />
        <StatCard label="Total return diterima" value={fmt(totalReturn)} accent />
      </div>
      <div className="ff-card" style={{ overflowX: 'auto' }}>
        <table className="ff-table">
          <thead>
            <tr>
              <th>Campaign</th><th>Modal</th><th>Return/th</th><th>Return diterima</th><th>Status</th><th>Payout berikut</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1, 2, 3].map((i) => <LoadingRow key={i} />)
              : safePortfolio.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', color: T.gray500, padding: '2rem' }}>Belum ada portfolio.</td></tr>
                : safePortfolio.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.campaign_name}</td>
                    <td>{fmt(p.amount)}</td>
                    <td><span style={{ color: T.green, fontWeight: 500 }}>{p.return_rate}</span></td>
                    <td style={{ color: T.green }}>{fmt(p.return_received)}</td>
                    <td>
                      <span className={`ff-badge ${p.status === 'active' ? 'ff-badge-green' : 'ff-badge-gray'}`}>
                        {p.status === 'active' ? 'Aktif' : p.status === 'funded' ? 'Terdanai' : p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: T.gray500 }}>{p.next_payout}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </>
  );
}

function TransaksiTab({ transactions, loading }) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: '1.5rem' }}>Riwayat transaksi</h2>
      <div className="ff-card" style={{ overflowX: 'auto' }}>
        <table className="ff-table">
          <thead>
            <tr>
              <th>Tanggal</th><th>Jenis</th><th>Campaign</th><th>Jumlah</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1, 2, 3].map((i) => <LoadingRow key={i} />)
              : safeTransactions.length === 0
                ? <tr><td colSpan={5} style={{ textAlign: 'center', color: T.gray500, padding: '2rem' }}>Belum ada transaksi.</td></tr>
                : safeTransactions.map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13, color: T.gray500 }}>
                      {t.date ? new Date(t.date).toLocaleDateString('id-ID') : '—'}
                    </td>
                    <td>
                      <span className="ff-badge ff-badge-blue">{t.type}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{t.campaign_name}</td>
                    <td style={{ fontWeight: 600, color: T.gray900 }}>−{fmt(t.amount)}</td>
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

export default function InvestorDashboard({ user, setPage }) {
  const [tab, setTab]                           = useState('overview');
  const [portfolio, setPortfolio]               = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [isMobile, setIsMobile]                 = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPortfolio();
        const raw = res.data?.investments ?? res.data?.portfolio ?? res.data ?? [];
        const safeRaw = Array.isArray(raw) ? raw : [];
        setPortfolio(safeRaw.map(normalizeInvestment));
      } catch (err) {
        console.error('Gagal fetch portfolio:', err.message);
        setPortfolio([]);
      } finally {
        setLoadingPortfolio(false);
      }
    };
    fetchData();
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const saldoFooter = (
    <div style={{ padding: 12, background: T.greenLight, borderRadius: 8, marginTop: 'auto' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.green, marginBottom: 4 }}>Akun</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.greenDark }}>{user?.name || '—'}</div>
      <div style={{ fontSize: 11, color: T.gray500, marginTop: 2 }}>{user?.email || '—'}</div>
    </div>
  );

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
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'block'
          }}
        >
          {isOpenMobileMenu ? '✕ Tutup Menu' : '📋 Menu Dashboard'}
        </button>
      )}

      {/* Sidebar - Menggunakan fallback menu internal langsung jika di mobile */}
      <div
        style={{
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
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: T.green, marginBottom: '0.5rem' }}>
            {initials}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, color: T.gray900 }}>{user?.name || '—'}</div>
          <div style={{ fontSize: 12, color: T.gray500 }}>Investor</div>
        </div>

        {/* JIKA DEKTOP: Gunakan komponen asli. JIKA MOBILE: Render menu internal murni yang anti-gagal */}
        {!isMobile ? (
          <Sidebar links={SIDEBAR_LINKS} activeTab={tab} setTab={setTab} footer={saldoFooter} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
            {SIDEBAR_LINKS.map((link) => {
              const isActive = tab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setTab(link.id);
                    setIsOpenMobileMenu(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', width: '100%', padding: '12px 14px',
                    borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: isActive ? T.greenLight : 'transparent',
                    color: isActive ? T.greenDark : T.gray700,
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 14
                  }}
                >
                  <span style={{ marginRight: 12, fontSize: 18, color: isActive ? T.green : T.gray400 }}>{link.icon}</span>
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
        flex: 1,
        padding: isMobile ? '1rem' : '2rem',
        background: T.gray50,
        overflow: 'auto',
        width: '100%',
      }}>
        {tab === 'overview'  && <Overview user={user} portfolio={portfolio} transactions={portfolio} loadingPortfolio={loadingPortfolio} setTab={setTab} />}
        {tab === 'portfolio' && <PortfolioTab portfolio={portfolio} loading={loadingPortfolio} />}
        {tab === 'txn'       && <TransaksiTab transactions={portfolio} loading={loadingPortfolio} />}
      </main>
    </div>
  );
}