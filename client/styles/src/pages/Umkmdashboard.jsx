import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Tambahkan ini
import { T } from '../../tokens';
import ProgressBar from '../components/ProgressBar';
import { getMyCampaign } from '../services/campaign';
import { getTransactions } from '../services/user';
import { fmt, pct } from '../utils/format';

const SIDEBAR_LINKS = [
  { id: 'overview', icon: '⊡', label: 'Ringkasan' },
  { id: 'campaign', icon: '◈', label: 'Campaign saya' },
  { id: 'txn', icon: '⊞', label: 'Transaksi' },
];

const MILESTONES = [{ label: 'Dokumen diserahkan' }, { label: 'Verifikasi lapangan' }, { label: 'Campaign tayang' }, { label: 'Target tercapai' }, { label: 'Dana dicairkan' }];

export default function UMKMDashboard({ user }) {
  // Hapus setPage dari sini
  const navigate = useNavigate(); // 2. Inisialisasi navigate
  const [tab, setTab] = useState('overview');
  const [campaign, setCampaign] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campRes, txnRes] = await Promise.all([getMyCampaign(), getTransactions()]);
        const campList = campRes.data?.campaigns || campRes.data;
        let campData = null;

        if (Array.isArray(campList) && campList.length > 0) {
          campData = campList[0];
        } else if (campList && !Array.isArray(campList) && Object.keys(campList).length > 0) {
          campData = campList;
        }

        if (campData && (!campData.title || parseFloat(campData.target_amount) === 0)) {
          setCampaign(null);
        } else {
          setCampaign(campData);
        }

        const tData = txnRes.data?.transactions || txnRes.data;
        setTransactions(Array.isArray(tData) ? tData : []);
      } catch (err) {
        console.error('Gagal fetch data UMKM:', err.message);
        setError('Gagal memuat data campaign.');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 56px)' }}>
        <p>Memuat dashboard...</p>
      </div>
    );

  const targetVal = campaign ? parseFloat(campaign.target_amount || 0) : 0;
  const raisedVal = campaign ? parseFloat(campaign.collected_amount || campaign.raised || 0) : 0;
  const progress = campaign ? pct(raisedVal, targetVal > 0 ? targetVal : 1) : 0;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  // ── RENDERER ──
  const renderEmptyState = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 350,
        flexDirection: 'column',
        gap: '1rem',
        background: T.white,
        borderRadius: 12,
        border: `1px solid ${T.gray200}`,
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 48 }}>🏪</div>
      <h2 style={{ fontWeight: 600, fontSize: 18 }}>Belum ada campaign</h2>
      <p style={{ color: T.gray500, fontSize: 14, maxWidth: 300 }}>Ajukan campaign baru untuk mulai mencari pendanaan.</p>
      <button className="ff-btn ff-btn-primary" onClick={() => navigate('/create-campaign')}>
        Ajukan Campaign
      </button>
    </div>
  );

  // ... (fungsi renderCampaignStats, renderMilestones, renderTransactions lainnya sama seperti milikmu) ...
  // Pastikan di dalam renderCampaignStats juga gunakan navigate jika perlu pindah halaman

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)', position: 'relative', flexDirection: isMobile ? 'column' : 'row' }}>
      {/* Sidebar dan Konten Utama ... (Gunakan logika yang sama seperti kodemu) */}
      {/* Tombol menu, sidebar, dan tab render semuanya tetap sama, navigasi sudah aman via navigate() */}
      <main style={{ flex: 1, padding: '2rem' }}>{tab === 'overview' && !campaign ? renderEmptyState() : <div>{/* Konten Dashboardmu */}</div>}</main>
    </div>
  );
}
