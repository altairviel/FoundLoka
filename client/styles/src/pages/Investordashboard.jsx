// client/src/pages/InvestorDashboard.jsx
import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import CampaignCard from '../components/CampaignCard';
import { getPortfolio, getTransactions } from '../services/user';
import { getCampaigns } from '../services/campaign';
import { fmt } from '../utils/format';

const SIDEBAR_LINKS = [
  { id: 'overview',  icon: '⊡', label: 'Ringkasan' },
  { id: 'portfolio', icon: '◈', label: 'Portfolio' },
  { id: 'explore',   icon: '◎', label: 'Jelajahi Campaign' },
  { id: 'txn',       icon: '⊞', label: 'Transaksi' },
];

// ── Loading skeleton sederhana ──
function LoadingRow() {
  return (
    <tr>
      {[1,2,3,4,5].map(i => (
        <td key={i}>
          <div style={{ height: 14, background: T.gray100, borderRadius: 4, width: '80%' }} />
        </td>
      ))}
    </tr>
  );
}

function Overview({ user, portfolio, transactions, loadingPortfolio, setTab }) {
  const totalInvested = portfolio.reduce((a, b) => a + (b.amount || b.invested || 0), 0);
  const totalReturn   = portfolio.reduce((a, b) => a + (b.return_received || b.returnVal || 0), 0);
  const activeCount   = portfolio.filter((p) => p.status === 'active' || p.status === 'Aktif').length;

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
        <StatCard label="ROI Keseluruhan"
          value={totalInvested > 0 ? `${((totalReturn / totalInvested) * 100).toFixed(1)}%` : '0%'}
        />
      </div>

      {/* Portfolio aktif */}
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
                ? [1,2,3].map(i => <LoadingRow key={i} />)
                : portfolio.length === 0
                  ? <tr><td colSpan={5} style={{ textAlign: 'center', color: T.gray500, padding: '2rem' }}>Belum ada investasi aktif.</td></tr>
                  : portfolio.slice(0, 5).map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{p.campaign_name || p.campaign}</td>
                      <td>{fmt(p.amount || p.invested)}</td>
                      <td><span style={{ color: T.green, fontWeight: 500 }}>{p.return_rate || p.return}</span></td>
                      <td>
                        <span className={`ff-badge ${(p.status === 'active' || p.status === 'Aktif') ? 'ff-badge-green' : 'ff-badge-gray'}`}>
                          {p.status === 'active' ? 'Aktif' : p.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: T.gray500 }}>{p.next_payout || p.nextPayout || '—'}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaksi terbaru */}
      <div className="ff-card">
        <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Transaksi terbaru</h3>
        {transactions.slice(0, 3).map((t, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? `1px solid ${T.gray100}` : 'none' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{t.campaign_name || t.campaign}</div>
              <div style={{ fontSize: 12, color: T.gray500 }}>
                {t.date ? new Date(t.date).toLocaleDateString('id-ID') : t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '—'}
                {' · '}{t.type}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.type === 'Return' ? T.green : T.gray900 }}>
                {t.type === 'Return' ? '+' : '−'}{fmt(t.amount)}
              </div>
              <span className="ff-badge ff-badge-green" style={{ fontSize: 11 }}>{t.status || 'Berhasil'}</span>
            </div>
          </div>
        ))}
        {transactions.length === 0 && !loadingPortfolio && (
          <p style={{ color: T.gray500, fontSize: 14, textAlign: 'center', padding: '1rem' }}>Belum ada transaksi.</p>
        )}
      </div>
    </>
  );
}

function PortfolioTab({ portfolio, loading }) {
  const totalInvested = portfolio.reduce((a, b) => a + (b.amount || b.invested || 0), 0);
  const totalReturn   = portfolio.reduce((a, b) => a + (b.return_received || b.returnVal || 0), 0);
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
              ? [1,2,3].map(i => <LoadingRow key={i} />)
              : portfolio.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', color: T.gray500, padding: '2rem' }}>Belum ada portfolio.</td></tr>
                : portfolio.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.campaign_name || p.campaign}</td>
                    <td>{fmt(p.amount || p.invested)}</td>
                    <td><span style={{ color: T.green, fontWeight: 500 }}>{p.return_rate || p.return}</span></td>
                    <td style={{ color: T.green }}>{fmt(p.return_received || p.returnVal || 0)}</td>
                    <td>
                      <span className={`ff-badge ${(p.status === 'active' || p.status === 'Aktif') ? 'ff-badge-green' : 'ff-badge-gray'}`}>
                        {p.status === 'active' ? 'Aktif' : p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: T.gray500 }}>{p.next_payout || p.nextPayout || '—'}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </>
  );
}

function ExploreTab({ campaigns, loading }) {
  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Jelajahi Campaign</h2>
      <p style={{ fontSize: 14, color: T.gray500, marginBottom: '1.5rem' }}>Semua UMKM telah diverifikasi tim FolkFund.</p>
      {loading
        ? <p style={{ color: T.gray500 }}>Memuat campaign...</p>
        : campaigns.length === 0
          ? <p style={{ color: T.gray500 }}>Belum ada campaign tersedia.</p>
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '1rem' }}>
              {campaigns.map((c) => (
                <CampaignCard key={c.id} c={c} onClick={() => {}} />
              ))}
            </div>
          )
      }
    </>
  );
}

function TransaksiTab({ transactions, loading }) {
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
              ? [1,2,3].map(i => <LoadingRow key={i} />)
              : transactions.length === 0
                ? <tr><td colSpan={5} style={{ textAlign: 'center', color: T.gray500, padding: '2rem' }}>Belum ada transaksi.</td></tr>
                : transactions.map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13, color: T.gray500 }}>
                      {t.date ? new Date(t.date).toLocaleDateString('id-ID') : new Date(t.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      <span className={`ff-badge ${t.type === 'Return' ? 'ff-badge-green' : 'ff-badge-blue'}`}>{t.type}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{t.campaign_name || t.campaign}</td>
                    <td style={{ fontWeight: 600, color: t.type === 'Return' ? T.green : T.gray900 }}>
                      {t.type === 'Return' ? '+' : '−'}{fmt(t.amount)}
                    </td>
                    <td><span className="ff-badge ff-badge-green">{t.status || 'Berhasil'}</span></td>
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
  const [tab, setTab] = useState('overview');
  const [portfolio, setPortfolio]       = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [campaigns, setCampaigns]       = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // Fetch portfolio & transaksi saat mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioRes, txnRes] = await Promise.all([
          getPortfolio(),
          getTransactions(),
        ]);
        setPortfolio(portfolioRes.data?.portfolio || portfolioRes.data || []);
        setTransactions(txnRes.data?.transactions || txnRes.data || []);
      } catch (err) {
        console.error('Gagal fetch portfolio:', err.message);
      } finally {
        setLoadingPortfolio(false);
      }
    };
    fetchData();
  }, []);

  // Fetch campaigns saat tab explore dibuka
  useEffect(() => {
    if (tab !== 'explore') return;
    const fetchCampaigns = async () => {
      setLoadingCampaigns(true);
      try {
        const res = await getCampaigns();
        setCampaigns(res.data?.campaigns || res.data || []);
      } catch (err) {
        console.error('Gagal fetch campaigns:', err.message);
      } finally {
        setLoadingCampaigns(false);
      }
    };
    fetchCampaigns();
  }, [tab]);

  const saldoFooter = (
    <div style={{ padding: 12, background: T.greenLight, borderRadius: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.green, marginBottom: 4 }}>Akun</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: T.greenDark }}>{user?.name || '—'}</div>
      <div style={{ fontSize: 12, color: T.gray500, marginTop: 2 }}>{user?.email || '—'}</div>
    </div>
  );

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ width: 240, borderRight: `1px solid ${T.gray200}`, padding: '1.5rem 1rem', background: T.white, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: T.green, marginBottom: '0.5rem' }}>
            {initials}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name || '—'}</div>
          <div style={{ fontSize: 12, color: T.gray500 }}>Investor</div>
        </div>
        <Sidebar links={SIDEBAR_LINKS} activeTab={tab} setTab={setTab} footer={saldoFooter} />
      </div>

      <main style={{ flex: 1, padding: '2rem', background: T.gray50, overflow: 'auto' }}>
        {tab === 'overview'  && <Overview user={user} portfolio={portfolio} transactions={transactions} loadingPortfolio={loadingPortfolio} setTab={setTab} />}
        {tab === 'portfolio' && <PortfolioTab portfolio={portfolio} loading={loadingPortfolio} />}
        {tab === 'explore'   && <ExploreTab campaigns={campaigns} loading={loadingCampaigns} />}
        {tab === 'txn'       && <TransaksiTab transactions={transactions} loading={loadingPortfolio} />}
      </main>
    </div>
  );
}