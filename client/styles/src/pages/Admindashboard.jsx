// client/styles/src/pages/Admindashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { T } from '../../tokens';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { fmt } from '../utils/format';
import { getAdminStats, getAllCampaigns, approveCampaign, rejectCampaign, disburseCampaign } from '../services/admin';
// Sidebar hanya dua tab sesuai fungsi backend
const SIDEBAR_LINKS = [
  { id: 'overview', icon: '⊡', label: 'Overview' },
  { id: 'campaigns', icon: '◈', label: 'Kelola Campaign' },
];

// ── Helpers ──
function Badge({ status }) {
  const map = {
    active: ['ff-badge-green', 'Aktif'],
    approved: ['ff-badge-green', 'Disetujui'],
    pending: ['ff-badge-yellow', 'Menunggu'],
    rejected: ['ff-badge-red', 'Ditolak'],
    funded: ['ff-badge-blue', 'Terdanai'],
    completed: ['ff-badge-gray', 'Selesai'],
    disbursed: ['ff-badge-purple', 'Dana Cair'],
  };
  const [cls, label] = map[status] ?? ['ff-badge-gray', status ?? '—'];
  return <span className={`ff-badge ${cls}`}>{label}</span>;
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
      }}
    >
      <div style={{ background: T.white, borderRadius: 12, padding: '2rem', maxWidth: 360, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <p style={{ fontSize: 15, color: T.gray900, marginBottom: '1.5rem', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="ff-btn ff-btn-sm" onClick={onCancel}>
            Batal
          </button>
          <button className="ff-btn ff-btn-sm" style={{ background: '#DC2626', color: T.white, borderColor: '#DC2626' }} onClick={onConfirm}>
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 99999,
        background: type === 'error' ? '#DC2626' : T.green,
        color: T.white,
        padding: '12px 20px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        animation: 'slideIn 0.2s ease',
      }}
    >
      {type === 'error' ? '⚠️ ' : '✓ '}
      {message}
    </div>
  );
}

function LoadingRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div style={{ height: 14, background: T.gray100, borderRadius: 4, width: '70%' }} />
        </td>
      ))}
    </tr>
  );
}

// ── Tab: Overview ──
function OverviewTab({ user, stats, loadingStats }) {
  if (loadingStats) return <p style={{ color: T.gray500 }}>Memuat statistik...</p>;

  const s = stats || {};
  const campaignsObj = s.campaigns || {};

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Selamat datang, {user?.name?.split(' ')[0] || 'Admin'} 👋</h2>
        <p style={{ fontSize: 14, color: T.gray500, margin: 0 }}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="ff-grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="Total Pengguna" value={s.total_users ?? '—'} />
        <StatCard label="Campaign Aktif" value={campaignsObj.active ?? 0} accent />
        <StatCard label="Campaign Menunggu" value={campaignsObj.pending ?? 0} />
        <StatCard label="Total Dana Terkumpul" value={s.total_invested != null ? fmt(s.total_invested) : '—'} accent />
      </div>

      <div className="ff-grid-2">
        <div className="ff-card">
          <h3 style={{ fontWeight: 600, fontSize: 15, margin: '0 0 1rem' }}>Distribusi Pengguna</h3>
          {[
            { label: 'Investor', value: s.total_investors ?? 0, color: '#3B82F6' },
            { label: 'Pemilik UMKM', value: s.total_owners ?? 0, color: T.green },
            { label: 'Admin', value: s.total_admins ?? 0, color: '#8B5CF6' },
          ].map((item) => {
            const total = (s.total_investors ?? 0) + (s.total_owners ?? 0) + (s.total_admins ?? 0) || 1;
            const pct = Math.round((item.value / total) * 100);
            return (
              <div key={item.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: T.gray700 }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: T.gray900 }}>
                    {item.value} ({pct}%)
                  </span>
                </div>
                <div style={{ height: 6, background: T.gray100, borderRadius: 99 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="ff-card">
          <h3 style={{ fontWeight: 600, fontSize: 15, margin: '0 0 1rem' }}>Ringkasan Platform</h3>
          {[
            { label: 'Total Investasi (Transaksi)', value: s.total_investments_count ?? 0 },
            { label: 'Campaign Selesai (Repaying)', value: campaignsObj.repaying ?? 0 },
            { label: 'Campaign Ditolak', value: campaignsObj.rejected ?? 0 },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: `1px solid ${T.gray100}`,
              }}
            >
              <span style={{ fontSize: 13, color: T.gray500 }}>{item.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.gray900 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Aksi yang tersedia sesuai backend: approve, reject, disburse
function CampaignsTab({ onToast, refreshStats }) {
  // Tambahkan prop refreshStats
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getAllCampaigns();
      setCampaigns(data.campaigns || data || []);
    } catch (err) {
      onToast('Gagal memuat campaign.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleAction = async () => {
    if (!confirm) return;
    const { action, id } = confirm;
    setActionLoading(id + action);
    setConfirm(null);
    try {
      if (action === 'approve') await approveCampaign(id);
      if (action === 'reject') await rejectCampaign(id);
      if (action === 'disburse') await disburseCampaign(id);

      onToast('Aksi berhasil.', 'success');

      // PENTING: Refresh tabel DAN refresh statistik di Overview
      await fetchCampaigns();
      if (refreshStats) await refreshStats();
    } catch (err) {
      onToast(err.response?.data?.message || 'Aksi gagal.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const FILTERS = ['all', 'pending', 'active', 'funded', 'rejected'];
  const FILTER_LABELS = { all: 'Semua', pending: 'Menunggu', active: 'Aktif', funded: 'Terdanai', rejected: 'Ditolak' };
  const filtered = filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter);
  const pendingCount = campaigns.filter((c) => c.status === 'pending').length;
  const fundedCount = campaigns.filter((c) => c.status === 'funded').length;
  return (
    <>
      {confirm && <ConfirmModal message={confirm.message} onConfirm={handleAction} onCancel={() => setConfirm(null)} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Kelola Campaign</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="ff-btn ff-btn-sm"
              style={{
                background: filter === f ? T.green : T.white,
                color: filter === f ? T.white : T.gray700,
                borderColor: filter === f ? T.green : T.gray200,
              }}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Info banner */}
      {(pendingCount > 0 || fundedCount > 0) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
          {pendingCount > 0 && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400E', flex: 1, minWidth: 200 }}>
              ⏳ <strong>{pendingCount}</strong> campaign menunggu persetujuan
            </div>
          )}
          {fundedCount > 0 && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#1E40AF', flex: 1, minWidth: 200 }}>
              💰 <strong>{fundedCount}</strong> campaign siap dicairkan dananya
            </div>
          )}
        </div>
      )}

      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ff-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Pemilik</th>
                <th>Target</th>
                <th>Terkumpul</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4].map((i) => <LoadingRow key={i} cols={6} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: T.gray500, padding: '2rem' }}>
                    Tidak ada campaign{filter !== 'all' ? ` dengan status "${FILTER_LABELS[filter]}"` : ''}.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const busy = actionLoading?.startsWith(String(c.id));
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title || c.name || '—'}</div>
                        <div style={{ fontSize: 12, color: T.gray500 }}>
                          {c.category || c.sector || '—'} · {c.location || '—'}
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{c.owner_name || c.user_name || '—'}</td>
                      <td style={{ fontWeight: 600 }}>{fmt(parseFloat(c.target_amount || 0))}</td>
                      <td style={{ color: T.green, fontWeight: 600 }}>{fmt(parseFloat(c.collected_amount || c.raised || 0))}</td>
                      <td>
                        <Badge status={c.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {/* Approve / Reject — hanya untuk campaign pending */}
                          {c.status === 'pending' && (
                            <>
                              <button
                                disabled={busy}
                                className="ff-btn ff-btn-sm"
                                style={{ background: T.green, color: T.white, borderColor: T.green, fontSize: 12 }}
                                onClick={() =>
                                  setConfirm({
                                    action: 'approve',
                                    id: c.id,
                                    message: `Setujui campaign "${c.title || c.name}"?`,
                                  })
                                }
                              >
                                ✓ Setujui
                              </button>
                              <button
                                disabled={busy}
                                className="ff-btn ff-btn-sm"
                                style={{ background: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA', fontSize: 12 }}
                                onClick={() =>
                                  setConfirm({
                                    action: 'reject',
                                    id: c.id,
                                    message: `Tolak campaign "${c.title || c.name}"?`,
                                  })
                                }
                              >
                                ✕ Tolak
                              </button>
                            </>
                          )}

                          {/* Disburse — hanya untuk campaign yang sudah funded */}
                          {c.status === 'funded' && (
                            <button
                              disabled={busy}
                              className="ff-btn ff-btn-sm"
                              style={{ background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE', fontSize: 12, fontWeight: 600 }}
                              onClick={() =>
                                setConfirm({
                                  action: 'disburse',
                                  id: c.id,
                                  message: `Cairkan dana campaign "${c.title || c.name}" sebesar ${fmt(parseFloat(c.collected_amount || 0))}? Tindakan ini tidak dapat dibatalkan.`,
                                })
                              }
                            >
                              💸 Cairkan Dana
                            </button>
                          )}

                          {/* Label jika tidak ada aksi */}
                          {!['pending', 'funded'].includes(c.status) && <span style={{ fontSize: 12, color: T.gray400 }}>—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Main ──
export default function AdminDashboard({ user }) {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // FIX: Tambahkan state yang hilang
  const [toast, setToast] = useState(null);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getAdminStats();
      setStats(data.stats || data);
    } catch (err) {
      console.warn('Gagal fetch stats:', err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'A';

  const adminFooter = (
    <div style={{ padding: 12, background: '#F3F0FF', borderRadius: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#7C3AED', marginBottom: 4 }}>Admin</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#4C1D95' }}>{user?.name || '—'}</div>
      <div style={{ fontSize: 11, color: T.gray500, marginTop: 2 }}>{user?.email || '—'}</div>
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        minHeight: 'calc(100vh - 56px)',
        position: 'relative',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Tombol Terapung Mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpenMobileMenu(!isOpenMobileMenu)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 10000,
            background: '#7C3AED',
            color: T.white,
            border: 'none',
            padding: '12px 24px',
            borderRadius: 30,
            fontWeight: 600,
            fontSize: 14,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          {isOpenMobileMenu ? '✕ Tutup Menu' : '⚙️ Menu Admin'}
        </button>
      )}

      {/* Sidebar */}
      <div
        style={{
          width: isMobile ? '100%' : 240,
          borderRight: isMobile ? 'none' : `1px solid ${T.gray200}`,
          padding: '1.5rem 1rem',
          background: T.white,
          display: isMobile ? (isOpenMobileMenu ? 'flex' : 'none') : 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'sticky',
          top: '56px',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          height: isMobile ? 'calc(100vh - 56px)' : 'auto',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#EDE9FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#7C3AED',
              marginBottom: '0.5rem',
            }}
          >
            {initials}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, color: T.gray900 }}>{user?.name || '—'}</div>
          <div style={{ fontSize: 12, color: T.gray500 }}>Administrator</div>
        </div>

        {!isMobile ? (
          <Sidebar links={SIDEBAR_LINKS} activeTab={tab} setTab={setTab} footer={adminFooter} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    background: isActive ? '#EDE9FE' : 'transparent',
                    color: isActive ? '#7C3AED' : T.gray700,
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 14,
                  }}
                >
                  <span style={{ marginRight: 12, fontSize: 18 }}>{link.icon}</span>
                  {link.label}
                </button>
              );
            })}
            <div style={{ marginTop: '2rem' }}>{adminFooter}</div>
          </div>
        )}
      </div>

      {/* Konten Utama */}
      <main style={{ flex: 1, padding: isMobile ? '1rem' : '2rem', background: T.gray50, overflow: 'auto', width: '100%' }}>
        {tab === 'overview' && <OverviewTab user={user} stats={stats} loadingStats={loadingStats} />}
        {tab === 'campaigns' && <CampaignsTab onToast={showToast} refreshStats={fetchStats} />}
      </main>
    </div>
  );
}
