// client/styles/src/pages/Umkmdashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../../tokens';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { getMyCampaign } from '../services/campaign';
import { getTransactions } from '../services/user';
import { fmt, pct } from '../utils/format';
import api from '../services/api';

const SIDEBAR_LINKS = [
  { id: 'overview',     icon: '⊡', label: 'Ringkasan' },
  { id: 'campaign',     icon: '◈', label: 'Campaign Saya' },
  { id: 'txn',          icon: '⊞', label: 'Transaksi' },
  { id: 'dana',         icon: '⬡', label: 'Dana & Kewajiban' },
];

const MILESTONES = [
  { label: 'Dokumen diserahkan' },
  { label: 'Verifikasi lapangan' },
  { label: 'Campaign tayang' },
  { label: 'Target tercapai' },
  { label: 'Dana dicairkan' },
];

// ── Helpers ──
function LoadingRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
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

// ── Overview ──
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

// ── Campaign Tab ──
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

// ── Transaksi Tab ──
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

// ── Dana & Kewajiban Tab ──
function DanaTab({ campaign, onToast }) {
  const [installments, setInstallments] = useState([]);
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [payLoading, setPayLoading]     = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchInstallments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/installments/my');
      setInstallments(data.installments || []);

      // hitung summary lokal
      const list = data.installments || [];
      setSummary({
        total:   list.length,
        paid:    list.filter((i) => i.status === 'paid').length,
        pending: list.filter((i) => i.status === 'pending').length,
        late:    list.filter((i) => i.status === 'late').length,
        totalAmount:   list.reduce((a, b) => a + parseFloat(b.amount || 0), 0),
        paidAmount:    list.filter((i) => i.status === 'paid').reduce((a, b) => a + parseFloat(b.amount || 0), 0),
        remainingAmount: list.filter((i) => i.status !== 'paid').reduce((a, b) => a + parseFloat(b.amount || 0), 0),
      });
    } catch (err) {
      // 404 berarti belum ada cicilan (campaign belum dicairkan)
      if (err.response?.status !== 404) {
        onToast?.('Gagal memuat data cicilan.', 'error');
      }
      setInstallments([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInstallments(); }, [fetchInstallments]);

  const handlePay = async (id, monthNumber) => {
    setPayLoading(id);
    try {
      await api.put(`/installments/${id}/pay`);
      onToast?.(`Cicilan bulan ke-${monthNumber} berhasil dibayar.`, 'success');
      await fetchInstallments();
    } catch (err) {
      onToast?.(err.response?.data?.message || 'Gagal membayar cicilan.', 'error');
    } finally {
      setPayLoading(null);
    }
  };

  const statusBadge = (s) => {
    if (s === 'paid')    return <span className="ff-badge ff-badge-green">Lunas</span>;
    if (s === 'late')    return <span className="ff-badge ff-badge-red">Terlambat</span>;
    return                      <span className="ff-badge ff-badge-yellow">Belum Bayar</span>;
  };

  const isDisbursed = campaign?.status === 'repaying' || campaign?.status === 'done';
  const filtered    = filterStatus === 'all' ? installments : installments.filter((i) => i.status === filterStatus);

  // ── Belum dicairkan ──
  if (!loading && !isDisbursed && installments.length === 0) {
    const statusLabel = {
      pending:  { icon: '⏳', text: 'Campaign masih dalam proses persetujuan admin.', color: '#92400E', bg: '#FFFBEB', border: '#FDE68A' },
      active:   { icon: '🚀', text: 'Campaign sedang aktif mencari pendanaan dari investor.', color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE' },
      funded:   { icon: '✅', text: 'Campaign sudah fully funded! Menunggu admin mencairkan dana.', color: '#065F46', bg: '#ECFDF5', border: '#6EE7B7' },
      rejected: { icon: '❌', text: 'Campaign ditolak admin.', color: '#991B1B', bg: '#FEF2F2', border: '#FECACA' },
    };
    const info = statusLabel[campaign?.status] || { icon: '📋', text: 'Belum ada data campaign.', color: T.gray500, bg: T.gray50, border: T.gray200 };

    return (
      <>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: '1.5rem' }}>Dana & Kewajiban</h2>

        {/* Status card */}
        <div style={{
          background: info.bg, border: `1px solid ${info.border}`,
          borderRadius: 12, padding: '2rem', textAlign: 'center', marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{info.icon}</div>
          <h3 style={{ fontWeight: 600, fontSize: 16, color: info.color, margin: '0 0 8px' }}>
            Cicilan belum tersedia
          </h3>
          <p style={{ fontSize: 14, color: info.color, margin: 0 }}>{info.text}</p>
        </div>

        {/* Alur proses */}
        <div className="ff-card">
          <h3 style={{ fontWeight: 600, fontSize: 15, margin: '0 0 1.25rem' }}>Alur Pencairan & Cicilan</h3>
          {[
            { step: 1, label: 'Campaign diajukan',         desc: 'Pemilik UMKM mengajukan campaign ke platform',           done: true },
            { step: 2, label: 'Persetujuan admin',          desc: 'Admin mereview dan menyetujui campaign',                done: ['active','funded','repaying','done'].includes(campaign?.status) },
            { step: 3, label: 'Pendanaan investor',         desc: 'Investor menyuntikkan modal hingga target terpenuhi',   done: ['funded','repaying','done'].includes(campaign?.status) },
            { step: 4, label: 'Pencairan oleh admin',       desc: 'Admin mencairkan dana — cicilan otomatis dibuat',       done: ['repaying','done'].includes(campaign?.status) },
            { step: 5, label: 'Pembayaran cicilan',         desc: 'UMKM membayar cicilan bulanan kepada investor',         done: campaign?.status === 'done' },
          ].map((s, i, arr) => (
            <div key={s.step} style={{ display: 'flex', gap: 14, marginBottom: i < arr.length - 1 ? 0 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: s.done ? T.green : T.gray200,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: s.done ? T.white : T.gray500,
                }}>
                  {s.done ? '✓' : s.step}
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 2, flex: 1, minHeight: 28, background: s.done ? T.green : T.gray200 }} />
                )}
              </div>
              <div style={{ paddingBottom: i < arr.length - 1 ? 20 : 0, paddingTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: s.done ? T.gray900 : T.gray500 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: T.gray500, marginTop: 2 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // ── Sudah ada cicilan ──
  const disbursedAmount = campaign ? parseFloat(campaign.collected_amount || 0) : 0;
  const returnRate      = campaign?.return_rate || 0;
  const tenorMonths     = campaign?.tenor_months || 0;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Dana & Kewajiban</h2>
        {campaign?.status === 'done' && (
          <span className="ff-badge ff-badge-green" style={{ fontSize: 13, padding: '6px 14px' }}>
            🎉 Semua Cicilan Lunas
          </span>
        )}
      </div>

      {/* Info banner dana cair */}
      <div style={{
        background: 'linear-gradient(135deg, #065F46 0%, #1a7a4a 100%)',
        borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem',
        color: T.white, display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ fontSize: 40 }}>💰</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>DANA YANG DICAIRKAN</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>{fmt(disbursedAmount)}</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
            Return {returnRate}%/tahun · Tenor {tenorMonths} bulan
          </div>
        </div>
        {summary && (
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{summary.paid}</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>Sudah Lunas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{summary.pending + summary.late}</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>Belum Bayar</div>
            </div>
          </div>
        )}
      </div>

      {/* Ringkasan kewajiban */}
      {summary && (
        <div className="ff-grid-3" style={{ marginBottom: '1.5rem' }}>
          <div className="ff-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: T.gray500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Kewajiban</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.gray900 }}>{fmt(summary.totalAmount)}</div>
            <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>{summary.total} cicilan</div>
          </div>
          <div className="ff-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: T.gray500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sudah Dibayar</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.green }}>{fmt(summary.paidAmount)}</div>
            <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>{summary.paid} cicilan lunas</div>
          </div>
          <div className="ff-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: T.gray500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sisa Kewajiban</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: summary.late > 0 ? '#DC2626' : '#D97706' }}>
              {fmt(summary.remainingAmount)}
            </div>
            <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>
              {summary.late > 0 && <span style={{ color: '#DC2626', fontWeight: 600 }}>⚠ {summary.late} terlambat · </span>}
              {summary.pending} belum dibayar
            </div>
          </div>
        </div>
      )}

      {/* Progress bar pelunasan */}
      {summary && summary.total > 0 && (
        <div className="ff-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Progress Pelunasan</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.green }}>
              {Math.round((summary.paid / summary.total) * 100)}%
            </span>
          </div>
          <div style={{ height: 10, background: T.gray100, borderRadius: 99 }}>
            <div style={{
              width: `${Math.round((summary.paid / summary.total) * 100)}%`,
              height: '100%', background: T.green, borderRadius: 99,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: T.gray500 }}>
            <span>{summary.paid} dari {summary.total} cicilan lunas</span>
            <span>{summary.total - summary.paid} sisa</span>
          </div>
        </div>
      )}

      {/* Tabel cicilan */}
      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>Jadwal Cicilan</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'pending', 'late', 'paid'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className="ff-btn ff-btn-sm"
                style={{
                  background:  filterStatus === f ? T.green : T.white,
                  color:       filterStatus === f ? T.white : T.gray700,
                  borderColor: filterStatus === f ? T.green : T.gray200,
                  fontSize: 12,
                }}
              >
                {{ all: 'Semua', pending: 'Belum Bayar', late: 'Terlambat', paid: 'Lunas' }[f]}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="ff-table">
            <thead>
              <tr>
                <th>Bulan ke-</th>
                <th>Jatuh Tempo</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Tanggal Bayar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1, 2, 3, 4].map((i) => <LoadingRow key={i} cols={6} />)
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: T.gray500, padding: '2rem' }}>
                        Tidak ada cicilan{filterStatus !== 'all' ? ' dengan filter ini' : ''}.
                      </td>
                    </tr>
                  )
                  : filtered.map((ins) => {
                    const isLate    = ins.status === 'late' || (ins.status === 'pending' && new Date(ins.due_date) < new Date());
                    const effectiveStatus = isLate && ins.status !== 'paid' ? 'late' : ins.status;
                    return (
                      <tr key={ins.id} style={{ background: effectiveStatus === 'late' ? '#FFF5F5' : 'inherit' }}>
                        <td style={{ fontWeight: 700, color: T.gray900 }}>
                          Bulan {ins.month_number}
                        </td>
                        <td style={{ fontSize: 13, color: effectiveStatus === 'late' ? '#DC2626' : T.gray700, fontWeight: effectiveStatus === 'late' ? 600 : 400 }}>
                          {ins.due_date ? new Date(ins.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          {effectiveStatus === 'late' && <span style={{ marginLeft: 6, fontSize: 11 }}>⚠</span>}
                        </td>
                        <td style={{ fontWeight: 600, color: T.gray900 }}>{fmt(parseFloat(ins.amount || 0))}</td>
                        <td>{statusBadge(effectiveStatus)}</td>
                        <td style={{ fontSize: 13, color: T.gray500 }}>
                          {ins.paid_at ? new Date(ins.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td>
                          {ins.status !== 'paid' ? (
                            <button
                              disabled={payLoading === ins.id}
                              className="ff-btn ff-btn-sm"
                              style={{
                                background: effectiveStatus === 'late' ? '#DC2626' : T.green,
                                color: T.white,
                                borderColor: effectiveStatus === 'late' ? '#DC2626' : T.green,
                                fontSize: 12,
                                opacity: payLoading === ins.id ? 0.6 : 1,
                              }}
                              onClick={() => handlePay(ins.id, ins.month_number)}
                            >
                              {payLoading === ins.id ? 'Memproses...' : '💳 Bayar'}
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>✓ Lunas</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Catatan */}
      <div style={{ marginTop: '1rem', padding: '12px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, fontSize: 13, color: '#92400E' }}>
        ⚠️ Cicilan yang melewati jatuh tempo akan otomatis berstatus <strong>Terlambat</strong>. Segera bayar untuk menghindari denda dan menjaga kepercayaan investor.
      </div>
    </>
  );
}

// ── Toast ──
function Toast({ message, type }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
      background: type === 'error' ? '#DC2626' : T.green,
      color: T.white, padding: '12px 20px', borderRadius: 10,
      fontSize: 14, fontWeight: 500, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    }}>
      {type === 'error' ? '⚠️ ' : '✓ '}{message}
    </div>
  );
}

// ── Main ──
export default function UMKMDashboard({ user }) {
  const navigate = useNavigate();
  const [tab, setTab]                   = useState('overview');
  const [campaign, setCampaign]         = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [toast, setToast]               = useState(null);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [isMobile, setIsMobile]         = useState(window.innerWidth <= 768);

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
          campData = null;
        }
        setCampaign(campData);

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

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

      {toast && <Toast message={toast.message} type={toast.type} />}

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
        {tab === 'dana'     && <DanaTab campaign={campaign} onToast={showToast} />}
      </main>
    </div>
  );
}