// client/styles/src/pages/CampaignDetail.jsx
import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import ProgressBar from '../components/ProgressBar';
import { getCampaignById } from '../services/campaign';
import api from '../services/api';
import { fmt, pct } from '../utils/format';

// ── Komponen bintang rating ──
function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#F59E0B' : T.gray200, fontSize: 14 }}>★</span>
      ))}
    </span>
  );
}

// ── Komponen pilih bintang ──
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map((s) => (
        <span
          key={s}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          style={{ cursor: 'pointer', fontSize: 24, color: s <= (hovered || value) ? '#F59E0B' : T.gray200 }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function CampaignDetail({ campaign: initialCampaign, role, onBack }) {
  const [campaign, setCampaign]       = useState(null);
  const [investors, setInvestors]     = useState([]);
  const [installments, setInstallments] = useState([]);
  const [reviews, setReviews]         = useState([]);
  const [avgRating, setAvgRating]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Investasi
  const [amount, setAmount]     = useState(500000);
  const [invLoading, setInvLoading] = useState(false);
  const [invMsg, setInvMsg]     = useState('');

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating]     = useState(0);
  const [reviewComment, setReviewComment]   = useState('');
  const [reviewLoading, setReviewLoading]   = useState(false);
  const [reviewMsg, setReviewMsg]           = useState('');

  useEffect(() => {
    if (!initialCampaign?.id) return;
    const fetch = async () => {
      setLoading(true);
      try {
        // GET /api/campaigns/:id → { campaign, investors, installments }
        const res = await getCampaignById(initialCampaign.id);
        const d   = res.data;
        setCampaign(d.campaign   || initialCampaign);
        setInvestors(Array.isArray(d.investors)    ? d.investors    : []);
        setInstallments(Array.isArray(d.installments) ? d.installments : []);

        // GET /api/reviews/campaign/:id
        const revRes = await api.get(`/reviews/campaign/${initialCampaign.id}`);
        setReviews(Array.isArray(revRes.data?.reviews) ? revRes.data.reviews : []);
        setAvgRating(revRes.data?.average_rating || null);
      } catch (err) {
        setError('Gagal memuat detail kampanye.');
        setCampaign(initialCampaign);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [initialCampaign]);

  const c = campaign || initialCampaign;
  if (!c) return null;

  const raised    = parseFloat(c.collected_amount ?? c.raised ?? 0);
  const target    = parseFloat(c.target_amount    ?? c.target ?? 1);
  const progress  = pct(raised, target);
  const returnRate = c.return_rate ?? c.return ?? '—';
  const tenor      = c.tenor_months ?? c.tenor ?? '—';
  const monthly    = tenor && returnRate && target
    ? Math.round((target * (1 + parseFloat(returnRate) / 100)) / parseInt(tenor))
    : null;

  // ── Handler Investasi via Midtrans ──
  const handleInvest = async () => {
    if (!amount || amount < 100000) return setInvMsg('⚠️ Minimum investasi Rp 100.000');
    setInvLoading(true);
    setInvMsg('');
    try {
      // POST /api/payments/invest → { snap_token }
      const res = await api.post('/payments/invest', { campaign_id: c.id, amount });
      const token = res.data?.snap_token;

      if (token && window.snap) {
        window.snap.pay(token, {
          onSuccess: () => setInvMsg('✅ Pembayaran berhasil! Investasi kamu sudah tercatat.'),
          onPending: () => setInvMsg('⏳ Pembayaran pending. Selesaikan pembayaran kamu.'),
          onError:   () => setInvMsg('⚠️ Pembayaran gagal. Silakan coba lagi.'),
          onClose:   () => setInvMsg(''),
        });
      } else {
        // Fallback jika Midtrans tidak dikonfigurasi
        await api.post('/investments', { campaign_id: c.id, amount });
        setInvMsg('✅ Investasi berhasil! Dana sedang diproses.');
      }
    } catch (err) {
      setInvMsg(`⚠️ ${err.response?.data?.message || 'Investasi gagal. Coba lagi.'}`);
    } finally {
      setInvLoading(false);
    }
  };

  // ── Handler Submit Review ──
  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) return setReviewMsg('⚠️ Pilih rating terlebih dahulu');
    setReviewLoading(true);
    setReviewMsg('');
    try {
      // POST /api/reviews
      await api.post('/reviews', { campaign_id: c.id, rating: reviewRating, comment: reviewComment });
      setReviewMsg('✅ Review berhasil dikirim!');
      setShowReviewForm(false);
      // Refresh reviews
      const revRes = await api.get(`/reviews/campaign/${c.id}`);
      setReviews(Array.isArray(revRes.data?.reviews) ? revRes.data.reviews : []);
      setAvgRating(revRes.data?.average_rating || null);
    } catch (err) {
      setReviewMsg(`⚠️ ${err.response?.data?.message || 'Gagal mengirim review.'}`);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)' }}>
      <div className="ff-container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

        {/* Tombol kembali */}
        <button className="ff-btn ff-btn-sm" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
          ← Kembali ke Kampanye
        </button>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

          {/* ── KIRI ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Info utama */}
            <div className="ff-card">
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 52, lineHeight: 1 }}>{c.img || c.icon || '🏪'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span className="ff-badge ff-badge-gray">{c.category || c.sector || '—'}</span>
                    {c.status === 'active' && <span className="ff-badge ff-badge-green">● Aktif</span>}
                    {c.status === 'funded' && <span className="ff-badge ff-badge-blue">✓ Terdanai</span>}
                    {avgRating && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <Stars rating={Math.round(avgRating)} />
                        <span style={{ color: T.gray500 }}>{avgRating}</span>
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                    {c.title || c.name}
                  </h1>
                  <p style={{ fontSize: 13, color: T.gray500 }}>
                    📍 {c.address || c.location || '—'}
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 15, lineHeight: 1.75, color: T.gray700, marginTop: '1.25rem' }}>
                {c.description || c.desc || 'Tidak ada deskripsi.'}
              </p>
            </div>

            {/* Penggunaan dana */}
            <div className="ff-card">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Penggunaan dana</h3>
              {(c.fund_usage || [
                { label: 'Alat produksi',    pct: 50 },
                { label: 'Modal kerja',      pct: 30 },
                { label: 'Biaya operasional',pct: 20 },
              ]).map((item) => (
                <div key={item.label} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14 }}>
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 500 }}>{item.pct}%</span>
                  </div>
                  <ProgressBar value={item.pct} />
                </div>
              ))}
            </div>

            {/* Profil pemilik */}
            <div className="ff-card">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Profil pemilik</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: T.greenLight, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18, fontWeight: 700, color: T.green,
                }}>
                  {(c.owner_name || 'P')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{c.owner_name || 'Pemilik Usaha'}</div>
                  <div style={{ fontSize: 13, color: T.gray500 }}>
                    {c.owner_phone ? `📞 ${c.owner_phone}` : 'Pemilik usaha'}
                  </div>
                </div>
              </div>
            </div>

            {/* Daftar investor */}
            {investors.length > 0 && (
              <div className="ff-card">
                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>
                  Investor ({investors.length})
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="ff-table">
                    <thead>
                      <tr><th>Nama</th><th>Jumlah</th><th>Tanggal</th></tr>
                    </thead>
                    <tbody>
                      {investors.map((inv, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{inv.name}</td>
                          <td style={{ color: T.green, fontWeight: 600 }}>{fmt(inv.amount)}</td>
                          <td style={{ fontSize: 13, color: T.gray500 }}>
                            {inv.created_at ? new Date(inv.created_at).toLocaleDateString('id-ID') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Jadwal cicilan — muncul kalau sudah funded */}
            {installments.length > 0 && (
              <div className="ff-card">
                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Jadwal Cicilan</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="ff-table">
                    <thead>
                      <tr><th>Bulan</th><th>Jatuh Tempo</th><th>Jumlah</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {installments.map((inst, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>Bulan {inst.month_number}</td>
                          <td style={{ fontSize: 13, color: T.gray500 }}>
                            {inst.due_date ? new Date(inst.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                          </td>
                          <td style={{ fontWeight: 600 }}>{fmt(inst.amount)}</td>
                          <td>
                            <span className={`ff-badge ${inst.status === 'paid' ? 'ff-badge-green' : 'ff-badge-gray'}`}>
                              {inst.status === 'paid' ? 'Lunas' : 'Belum'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Review investor */}
            <div className="ff-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontWeight: 600 }}>Review Investor</h3>
                  {avgRating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Stars rating={Math.round(avgRating)} />
                      <span style={{ fontSize: 13, color: T.gray500 }}>{avgRating} / 5 ({reviews.length} review)</span>
                    </div>
                  )}
                </div>
                {role === 'investor' && !showReviewForm && (
                  <button className="ff-btn ff-btn-sm" onClick={() => setShowReviewForm(true)}>
                    + Tulis Review
                  </button>
                )}
              </div>

              {/* Form review */}
              {showReviewForm && (
                <form onSubmit={handleReview} style={{
                  background: T.gray50, border: T.border, borderRadius: 8,
                  padding: '1rem', marginBottom: '1rem',
                }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Rating</label>
                    <StarPicker value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Komentar (opsional)</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder="Bagikan pengalaman investasi kamu..."
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 14,
                        border: `1px solid ${T.gray200}`, borderRadius: 6,
                        outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  {reviewMsg && (
                    <div style={{ fontSize: 13, marginBottom: '0.75rem', color: reviewMsg.startsWith('✅') ? '#065F46' : '#B91C1C' }}>
                      {reviewMsg}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" className="ff-btn ff-btn-sm" onClick={() => setShowReviewForm(false)}>Batal</button>
                    <button
                      type="submit"
                      className="ff-btn ff-btn-sm"
                      style={{ background: T.green, color: T.white, borderColor: T.green, opacity: reviewLoading ? 0.7 : 1 }}
                      disabled={reviewLoading}
                    >
                      {reviewLoading ? 'Mengirim...' : 'Kirim Review'}
                    </button>
                  </div>
                </form>
              )}

              {/* List review */}
              {reviews.length === 0 ? (
                <p style={{ color: T.gray500, fontSize: 14, textAlign: 'center', padding: '1rem 0' }}>
                  Belum ada review.
                </p>
              ) : (
                reviews.map((r, i) => (
                  <div key={i} style={{
                    paddingBottom: '1rem', marginBottom: '1rem',
                    borderBottom: i < reviews.length - 1 ? `1px solid ${T.gray100}` : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.investor_name || 'Investor'}</div>
                      <Stars rating={r.rating} />
                    </div>
                    {r.comment && (
                      <p style={{ fontSize: 14, color: T.gray700, lineHeight: 1.6 }}>{r.comment}</p>
                    )}
                    <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* ── KANAN: Panel investasi ── */}
          <div>
            <div className="ff-card" style={{ position: 'sticky', top: 72 }}>

              {/* Progress pendanaan */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 700 }}>{fmt(raised)}</span>
                  <span style={{ fontSize: 13, color: T.green, fontWeight: 600 }}>{progress}%</span>
                </div>
                <div style={{ fontSize: 13, color: T.gray500, marginBottom: 8 }}>
                  dari target {fmt(target)}
                </div>
                <ProgressBar value={progress} height={8} />
              </div>

              <div style={{ height: 1, background: T.gray200, margin: '1rem 0' }} />

              {/* Info singkat */}
              {[
                ['Return',   `${returnRate}${typeof returnRate === 'number' ? '%' : ''}/tahun`],
                ['Tenor',    `${tenor}${typeof tenor === 'number' ? ' bulan' : ''}`],
                ['Est. cicilan/bln', monthly ? fmt(monthly) : '—'],
                ['Risiko',   c.risk || c.risk_level || '—'],
                ['Investor', `${c.investor_count ?? investors.length} orang`],
                ['Deadline', c.deadline ? new Date(c.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: T.gray500 }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}

              <div style={{ height: 1, background: T.gray200, margin: '1rem 0' }} />

              {/* Form investasi — investor only */}
              {role === 'investor' && c.status === 'active' ? (
                <>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    Jumlah investasi (Rp)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    min={100000}
                    step={50000}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    style={{
                      width: '100%', padding: '8px 12px', fontSize: 14,
                      border: `1px solid ${T.gray200}`, borderRadius: 6,
                      outline: 'none', boxSizing: 'border-box', marginBottom: '0.75rem',
                    }}
                  />

                  {/* Estimasi return */}
                  {amount >= 100000 && (
                    <div style={{
                      background: T.greenLight, border: `1px solid ${T.green}20`,
                      borderRadius: 6, padding: '10px 12px', marginBottom: '0.75rem', fontSize: 13,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: T.gray700 }}>Estimasi total return</span>
                        <span style={{ fontWeight: 700, color: T.green }}>
                          {fmt(Math.round(amount * (1 + parseFloat(returnRate) / 100)))}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ color: T.gray500 }}>Return per bulan</span>
                        <span style={{ color: T.green }}>
                          {tenor ? fmt(Math.round(amount * (1 + parseFloat(returnRate) / 100) / parseInt(tenor))) : '—'}
                        </span>
                      </div>
                    </div>
                  )}

                  {invMsg && (
                    <div style={{
                      fontSize: 13, padding: '8px 10px', borderRadius: 6, marginBottom: '0.75rem',
                      background: invMsg.startsWith('✅') ? '#D1FAE5' : invMsg.startsWith('⏳') ? '#FEF3C7' : '#FEE2E2',
                      color:      invMsg.startsWith('✅') ? '#065F46' : invMsg.startsWith('⏳') ? '#92400E' : '#B91C1C',
                    }}>
                      {invMsg}
                    </div>
                  )}

                  <button
                    onClick={handleInvest}
                    disabled={invLoading}
                    style={{
                      width: '100%', padding: '12px', fontSize: 15, fontWeight: 600,
                      background: T.green, color: T.white, border: 'none', borderRadius: 8,
                      cursor: invLoading ? 'not-allowed' : 'pointer',
                      opacity: invLoading ? 0.7 : 1,
                    }}
                  >
                    {invLoading ? 'Memproses...' : '💳 Investasi Sekarang'}
                  </button>
                  <p style={{ fontSize: 11, color: T.gray500, textAlign: 'center', marginTop: 8 }}>
                    Minimum Rp 100.000 · Pembayaran via Midtrans
                  </p>
                </>
              ) : role === 'investor' && c.status !== 'active' ? (
                <div style={{ textAlign: 'center', padding: '1rem 0', fontSize: 14, color: T.gray500 }}>
                  Kampanye ini sudah tidak menerima investasi.
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0', fontSize: 13, color: T.gray500 }}>
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