// client/styles/src/pages/Installments.jsx
// Owner only — jadwal cicilan semua kampanye
import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import api from '../services/api';
import { fmt } from '../utils/format';

// ── Badge status cicilan ──
function StatusBadge({ status }) {
  const map = {
    paid:    { label: 'Lunas',     bg: '#D1FAE5', color: '#065F46' },
    pending: { label: 'Belum',     bg: '#FEF3C7', color: '#92400E' },
    late:    { label: 'Terlambat', bg: '#FEE2E2', color: '#B91C1C' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

// ── Ringkasan card ──
function SummaryCard({ label, value, color }) {
  return (
    <div style={{
      flex: 1, minWidth: 120, padding: '1rem 1.25rem',
      background: T.white, border: T.border, borderRadius: 10,
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: T.gray500, marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function Installments({ onBack }) {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [payingId, setPayingId]         = useState(null);
  const [payMsg, setPayMsg]             = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterCampaign, setFilterCampaign] = useState('semua');

  useEffect(() => { fetchInstallments(); }, []);

  const fetchInstallments = async () => {
    setLoading(true);
    try {
      // GET /api/installments/my → { installments: [...] }
      const res = await api.get('/installments/my');
      const raw = Array.isArray(res.data?.installments) ? res.data.installments : [];
      setInstallments(raw);
    } catch (err) {
      setError('Gagal memuat jadwal cicilan.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handler bayar cicilan via Midtrans ──
  const handlePay = async (inst) => {
    setPayingId(inst.id);
    setPayMsg('');
    try {
      // POST /api/payments/installment → { snap_token }
      const res = await api.post('/payments/installment', { installment_id: inst.id });
      const token = res.data?.snap_token;

      if (token && window.snap) {
        window.snap.pay(token, {
          onSuccess: async () => {
            setPayMsg('✅ Cicilan berhasil dibayar!');
            await fetchInstallments(); // refresh
          },
          onPending: () => setPayMsg('⏳ Pembayaran pending. Selesaikan di aplikasi bank kamu.'),
          onError:   () => setPayMsg('⚠️ Pembayaran gagal. Silakan coba lagi.'),
          onClose:   () => {},
        });
      } else {
        // Fallback: tandai langsung via PUT /api/installments/:id/pay
        await api.put(`/installments/${inst.id}/pay`);
        setPayMsg('✅ Cicilan berhasil ditandai lunas!');
        await fetchInstallments();
      }
    } catch (err) {
      setPayMsg(`⚠️ ${err.response?.data?.message || 'Gagal memproses pembayaran.'}`);
    } finally {
      setPayingId(null);
    }
  };

  // ── Kalkulasi ringkasan ──
  const safeAll  = Array.isArray(installments) ? installments : [];
  const total    = safeAll.length;
  const paid     = safeAll.filter((i) => i.status === 'paid').length;
  const late     = safeAll.filter((i) => i.status === 'late').length;
  const pending  = safeAll.filter((i) => i.status === 'pending').length;
  const totalNominal = safeAll.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  const paidNominal  = safeAll.filter((i) => i.status === 'paid')
                              .reduce((s, i) => s + parseFloat(i.amount || 0), 0);

  // ── Daftar kampanye unik untuk filter ──
  const campaignList = [...new Set(safeAll.map((i) => i.campaign_title || i.campaign_id))];

  // ── Filter tampilan ──
  const filtered = safeAll.filter((i) => {
    const matchStatus   = filterStatus   === 'semua' || i.status === filterStatus;
    const matchCampaign = filterCampaign === 'semua' || (i.campaign_title || i.campaign_id) === filterCampaign;
    return matchStatus && matchCampaign;
  });

  // ── Kelompokkan per kampanye ──
  const grouped = filtered.reduce((acc, inst) => {
    const key = inst.campaign_title || inst.campaign_id || 'Kampanye';
    if (!acc[key]) acc[key] = [];
    acc[key].push(inst);
    return acc;
  }, {});

  return (
    <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)', padding: '2rem 0' }}>
      <div className="ff-container">

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          {onBack && (
            <button className="ff-btn ff-btn-sm" onClick={onBack} style={{ marginBottom: '1rem' }}>
              ← Kembali
            </button>
          )}
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Jadwal Cicilan</h1>
          <p style={{ fontSize: 14, color: T.gray500 }}>
            Pantau dan bayar cicilan bulanan dari semua kampanye kamu.
          </p>
        </div>

        {/* Pesan bayar */}
        {payMsg && (
          <div style={{
            fontSize: 14, padding: '10px 14px', borderRadius: 8, marginBottom: '1.5rem',
            background: payMsg.startsWith('✅') ? '#D1FAE5' : payMsg.startsWith('⏳') ? '#FEF3C7' : '#FEE2E2',
            color:      payMsg.startsWith('✅') ? '#065F46' : payMsg.startsWith('⏳') ? '#92400E' : '#B91C1C',
          }}>
            {payMsg}
          </div>
        )}

        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Ringkasan */}
        {!loading && total > 0 && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <SummaryCard label="Total Cicilan"      value={total}   color={T.gray500} />
            <SummaryCard label="Lunas"              value={paid}    color="#059669" />
            <SummaryCard label="Belum Dibayar"      value={pending} color="#D97706" />
            <SummaryCard label="Terlambat"          value={late}    color="#DC2626" />
            <div style={{
              flex: 2, minWidth: 200, padding: '1rem 1.25rem',
              background: T.white, border: T.border, borderRadius: 10,
              borderTop: `3px solid ${T.green}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: T.gray500 }}>Sudah dibayar</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.green }}>{fmt(paidNominal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: T.gray500 }}>Total kewajiban</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(totalNominal)}</span>
              </div>
              {/* Progress bar lunas */}
              <div style={{ marginTop: 10, height: 6, background: T.gray200, borderRadius: 3 }}>
                <div style={{
                  height: 6, borderRadius: 3, background: T.green,
                  width: `${totalNominal > 0 ? Math.round((paidNominal / totalNominal) * 100) : 0}%`,
                  transition: 'width 0.4s',
                }} />
              </div>
              <div style={{ fontSize: 11, color: T.gray500, marginTop: 4, textAlign: 'right' }}>
                {totalNominal > 0 ? Math.round((paidNominal / totalNominal) * 100) : 0}% lunas
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        {!loading && total > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['semua', 'pending', 'late', 'paid'].map((s) => (
                <button
                  key={s}
                  className="ff-btn ff-btn-sm"
                  onClick={() => setFilterStatus(s)}
                  style={{
                    background:  filterStatus === s ? T.green : T.white,
                    color:       filterStatus === s ? T.white : T.gray700,
                    borderColor: filterStatus === s ? T.green : T.gray300,
                  }}
                >
                  {s === 'semua' ? 'Semua' : s === 'pending' ? 'Belum' : s === 'late' ? 'Terlambat' : 'Lunas'}
                </button>
              ))}
            </div>
            {campaignList.length > 1 && (
              <select
                value={filterCampaign}
                onChange={(e) => setFilterCampaign(e.target.value)}
                style={{
                  padding: '6px 10px', fontSize: 13,
                  border: `1px solid ${T.gray200}`, borderRadius: 6,
                  background: T.white, outline: 'none',
                }}
              >
                <option value="semua">Semua Kampanye</option>
                {campaignList.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
        )}

        {/* Konten */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1,2,3].map((i) => (
              <div key={i} style={{ height: 200, background: T.gray100, borderRadius: 10 }} />
            ))}
          </div>
        ) : total === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: T.white, borderRadius: 10, border: T.border,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Belum ada jadwal cicilan</h3>
            <p style={{ color: T.gray500, fontSize: 14 }}>
              Jadwal cicilan akan muncul otomatis ketika kampanye kamu sudah terdanai penuh.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: T.gray500, fontSize: 14 }}>
            Tidak ada cicilan dengan filter ini.
          </div>
        ) : (
          // Render per grup kampanye
          Object.entries(grouped).map(([campaignName, insts]) => {
            const grpPaid = insts.filter((i) => i.status === 'paid').length;
            const grpLate = insts.filter((i) => i.status === 'late').length;
            return (
              <div key={campaignName} style={{ marginBottom: '2rem' }}>
                {/* Header grup */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 16px', background: T.gray100,
                  borderRadius: '10px 10px 0 0', border: T.border, borderBottom: 'none',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>🏪 {campaignName}</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                    <span style={{ color: '#059669', fontWeight: 600 }}>{grpPaid} lunas</span>
                    {grpLate > 0 && <span style={{ color: '#DC2626', fontWeight: 600 }}>{grpLate} terlambat</span>}
                    <span style={{ color: T.gray500 }}>{insts.length} total</span>
                  </div>
                </div>

                {/* Tabel cicilan */}
                <div style={{
                  background: T.white, border: T.border,
                  borderRadius: '0 0 10px 10px', overflowX: 'auto',
                }}>
                  <table className="ff-table" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th>Bulan</th>
                        <th>Jatuh Tempo</th>
                        <th>Jumlah</th>
                        <th>Status</th>
                        <th>Dibayar</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insts.map((inst) => {
                        const isLate    = inst.status === 'late';
                        const isPaid    = inst.status === 'paid';
                        const isPaying  = payingId === inst.id;
                        const dueDate   = inst.due_date ? new Date(inst.due_date) : null;
                        const today     = new Date();
                        const daysLeft  = dueDate
                          ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
                          : null;

                        return (
                          <tr
                            key={inst.id}
                            style={{
                              background: isLate ? '#FFF7F7' : isPaid ? '#F0FDF4' : T.white,
                            }}
                          >
                            <td style={{ fontWeight: 600 }}>Bulan {inst.month_number}</td>
                            <td>
                              <div style={{ fontSize: 14 }}>
                                {dueDate ? dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                              </div>
                              {!isPaid && daysLeft !== null && (
                                <div style={{
                                  fontSize: 11, marginTop: 2,
                                  color: daysLeft < 0 ? '#DC2626' : daysLeft <= 7 ? '#D97706' : T.gray500,
                                }}>
                                  {daysLeft < 0
                                    ? `${Math.abs(daysLeft)} hari terlambat`
                                    : daysLeft === 0
                                      ? 'Jatuh tempo hari ini!'
                                      : `${daysLeft} hari lagi`}
                                </div>
                              )}
                            </td>
                            <td style={{ fontWeight: 700 }}>{fmt(parseFloat(inst.amount || 0))}</td>
                            <td><StatusBadge status={inst.status} /></td>
                            <td style={{ fontSize: 13, color: T.gray500 }}>
                              {inst.paid_at
                                ? new Date(inst.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '—'}
                            </td>
                            <td>
                              {isPaid ? (
                                <span style={{ fontSize: 13, color: '#059669' }}>✓ Lunas</span>
                              ) : (
                                <button
                                  onClick={() => handlePay(inst)}
                                  disabled={isPaying}
                                  style={{
                                    padding: '6px 14px', fontSize: 13, fontWeight: 600,
                                    background: isLate ? '#DC2626' : T.green,
                                    color: T.white, border: 'none', borderRadius: 6,
                                    cursor: isPaying ? 'not-allowed' : 'pointer',
                                    opacity: isPaying ? 0.7 : 1,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {isPaying ? '...' : isLate ? '⚡ Bayar Sekarang' : '💳 Bayar'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}