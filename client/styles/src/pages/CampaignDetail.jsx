import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../../tokens';
import ProgressBar from '../components/ProgressBar';
import PaymentButton from '../components/PaymentButton'; // 💳 Komponen tombol pembayaran Midtrans ganda
import { getCampaignById } from '../services/campaign';
import api from '../services/api';
import { fmt, pct } from '../utils/format';

function Stars({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#F59E0B' : T.gray200, fontSize: 14 }}>
          ★
        </span>
      ))}
    </span>
  );
}

// Custom hook untuk mendeteksi layar mobile secara dinamis
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} onClick={() => onChange(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} style={{ cursor: 'pointer', fontSize: 24, color: s <= (hovered || value) ? '#F59E0B' : T.gray200 }}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function CampaignDetail({ role }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [campaign, setCampaign] = useState(null);
  const [investors, setInvestors] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [amount, setAmount] = useState(500000);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  // Fungsi penarik data dari database backend lokal
  const fetchDetail = useCallback(async () => {
    const id = localStorage.getItem('selectedCampaignId');
    if (!id) {
      navigate('/campaign');
      return;
    }
    try {
      const res = await getCampaignById(id);
      const d = res.data;
      setCampaign(d.campaign || d);
      setInvestors(Array.isArray(d.investors) ? d.investors : []);
      setInstallments(Array.isArray(d.installments) ? d.installments : []);

      try {
        const revRes = await api.get(`/reviews/campaign/${id}`);
        setReviews(Array.isArray(revRes.data?.reviews) ? revRes.data.reviews : []);
        setAvgRating(revRes.data?.average_rating || null);
      } catch {
        // review opsional jika belum ada data
      }
    } catch (err) {
      setError('Gagal memuat detail kampanye. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    fetchDetail();
  }, [fetchDetail]);

  const handleBack = () => navigate('/campaign');

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) return setReviewMsg('⚠️ Pilih rating terlebih dahulu');
    setReviewLoading(true);
    setReviewMsg('');
    try {
      await api.post('/reviews', { campaign_id: campaign.id, rating: reviewRating, comment: reviewComment });
      setReviewMsg('✅ Review berhasil dikirim!');
      setShowReviewForm(false);
      const revRes = await api.get(`/reviews/campaign/${campaign.id}`);
      setReviews(Array.isArray(revRes.data?.reviews) ? revRes.data.reviews : []);
      setAvgRating(revRes.data?.average_rating || null);
    } catch (err) {
      setReviewMsg(`⚠️ ${err.response?.data?.message || 'Gagal mengirim review.'}`);
    } finally {
      setReviewLoading(false);
    }
  };

  // ── Loading skeleton (Responsif Mobile) ──
  if (loading)
    return (
      <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)', padding: isMobile ? '1rem' : '2rem 0' }}>
        <div className="ff-container">
          <div style={{ height: 14, width: 120, background: T.gray200, borderRadius: 6, marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              {[200, 140, 120].map((h, i) => (
                <div key={i} style={{ height: h, background: T.gray100, borderRadius: 10 }} />
              ))}
            </div>
            <div style={{ height: 350, width: isMobile ? '100%' : '360px', background: T.gray100, borderRadius: 10 }} />
          </div>
        </div>
      </div>
    );

  if (error && !campaign)
    return (
      <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{error}</div>
          <button className="ff-btn" onClick={handleBack}>
            ← Kembali ke Kampanye
          </button>
        </div>
      </div>
    );

  const c = campaign;
  if (!c) return null;

  const raised = parseFloat(c.collected_amount ?? c.raised ?? 0);
  const target = parseFloat(c.target_amount ?? c.target ?? 1);
  const progress = pct(raised, target);
  const returnRate = c.return_rate ?? c.return ?? '—';
  const tenor = c.tenor_months ?? c.tenor ?? '—';
  const monthly = tenor && returnRate && target ? Math.round((target * (1 + parseFloat(returnRate) / 100)) / parseInt(tenor)) : null;

  return (
    <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)' }}>
      <div className="ff-container" style={{ paddingTop: isMobile ? '1rem' : '2rem', paddingBottom: '4rem', paddingLeft: isMobile ? '1rem' : undefined, paddingRight: isMobile ? '1rem' : undefined }}>
        <button className="ff-btn ff-btn-sm" onClick={handleBack} style={{ marginBottom: '1.5rem' }}>
          ← Kembali ke Kampanye
        </button>

        {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1rem' }}>⚠️ {error}</div>}

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '2rem', alignItems: 'start' }}>
          {/* ── KIRI / UTAMA ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, width: '100%' }}>
            {/* Info utama */}
            <div className="ff-card" style={{ padding: isMobile ? '1.25rem' : undefined }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, alignItems: isMobile ? 'center' : 'flex-start', textAlign: isMobile ? 'center' : 'left' }}>
                <div style={{ fontSize: isMobile ? 64 : 52, lineHeight: 1 }}>{c.img || c.icon || '🏪'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, justifyContent: isMobile ? 'center' : 'flex-start' }}>
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
                  <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, marginBottom: 4 }}>{c.title || c.name}</h1>
                  <p style={{ fontSize: 13, color: T.gray500 }}>📍 {c.address || c.location || '—'}</p>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: T.gray700, marginTop: '1.25rem', textAlign: 'justify' }}>{c.description || c.desc || 'Tidak ada deskripsi.'}</p>
            </div>

            {/* Profil pemilik */}
            <div className="ff-card">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Profil pemilik</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: T.green }}>
                  {(c.owner_name || 'P')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{c.owner_name || 'Pemilik Usaha'}</div>
                  <div style={{ fontSize: 13, color: T.gray500 }}>{c.owner_phone ? `📞 ${c.owner_phone}` : 'Pemilik usaha'}</div>
                </div>
              </div>
            </div>

            {/* Daftar investor */}
            {investors.length > 0 && (
              <div className="ff-card">
                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Investor ({investors.length})</h3>
                <div style={{ overflowX: 'auto', margin: isMobile ? '0 -1.25rem' : undefined, padding: isMobile ? '0 1.25rem' : undefined }}>
                  <table className="ff-table" style={{ minWidth: isMobile ? '400px' : '100%' }}>
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>Jumlah</th>
                        <th>Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investors.map((inv, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{inv.name}</td>
                          <td style={{ color: T.green, fontWeight: 600 }}>{fmt(inv.amount)}</td>
                          <td style={{ fontSize: 13, color: T.gray500 }}>{inv.created_at ? new Date(inv.created_at).toLocaleDateString('id-ID') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Jadwal cicilan */}
            {installments.length > 0 && (
              <div className="ff-card">
                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Jadwal Cicilan</h3>
                <div style={{ overflowX: 'auto', margin: isMobile ? '0 -1.25rem' : undefined, padding: isMobile ? '0 1.25rem' : undefined }}>
                  <table className="ff-table" style={{ minWidth: isMobile ? '500px' : '100%' }}>
                    <thead>
                      <tr>
                        <th>Bulan</th>
                        <th>Jatuh Tempo</th>
                        <th>Jumlah</th>
                        <th>Status / Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {installments.map((inst, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>Bulan {inst.month_number}</td>
                          <td style={{ fontSize: 13, color: T.gray500 }}>{inst.due_date ? new Date(inst.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</td>
                          <td style={{ fontWeight: 600 }}>{fmt(inst.amount)}</td>
                          <td>
                            {/* 💡 SINKRONISASI TOMBOL PEMBAYARAN CICILAN KHUSUS OWNER */}
                            {inst.status === 'paid' ? (
                              <span className="ff-badge ff-badge-green">Lunas</span>
                            ) : role === 'owner' || role === 'umkm' ? (
                              <PaymentButton
                                type="installment"
                                installmentId={inst.id || inst.installment_id}
                                label="💳 Bayar Cicilan"
                                style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6 }}
                                onSuccess={() => fetchDetail()} // Ambil data baru setelah cicilan sukses dibayar
                              />
                            ) : (
                              <span className="ff-badge ff-badge-gray">Belum</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Review */}
            <div className="ff-card">
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 12 : 0, marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontWeight: 600 }}>Review Investor</h3>
                  {avgRating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Stars rating={Math.round(avgRating)} />
                      <span style={{ fontSize: 13, color: T.gray500 }}>
                        {avgRating} / 5 ({reviews.length} review)
                      </span>
                    </div>
                  )}
                </div>
                {role === 'investor' && !showReviewForm && (
                  <button className="ff-btn ff-btn-sm" style={{ width: isMobile ? '100%' : 'auto' }} onClick={() => setShowReviewForm(true)}>
                    + Tulis Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form onSubmit={handleReview} style={{ background: T.gray50, border: T.border, borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
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
                      style={{ width: '100%', padding: '8px 12px', fontSize: 14, border: `1px solid ${T.gray200}`, borderRadius: 6, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                  </div>
                  {reviewMsg && <div style={{ fontSize: 13, marginBottom: '0.75rem', color: reviewMsg.startsWith('✅') ? '#065F46' : '#B91C1C' }}>{reviewMsg}</div>}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" className="ff-btn ff-btn-sm" onClick={() => setShowReviewForm(false)}>
                      Batal
                    </button>
                    <button type="submit" className="ff-btn ff-btn-sm" style={{ background: T.green, color: T.white, borderColor: T.green, opacity: reviewLoading ? 0.7 : 1 }} disabled={reviewLoading}>
                      {reviewLoading ? 'Mengirim...' : 'Kirim Review'}
                    </button>
                  </div>
                </form>
              )}

              {reviews.length === 0 ? (
                <p style={{ color: T.gray500, fontSize: 14, textAlign: 'center', padding: '1rem 0' }}>Belum ada review.</p>
              ) : (
                reviews.map((r, i) => (
                  <div key={i} style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: i < reviews.length - 1 ? `1px solid ${T.gray100}` : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.investor_name || 'Investor'}</div>
                      <Stars rating={r.rating} />
                    </div>
                    {r.comment && <p style={{ fontSize: 14, color: T.gray700, lineHeight: 1.6 }}>{r.comment}</p>}
                    <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>{r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── KANAN / PANEL INVESTASI ── */}
          <div style={{ width: '100%', maxWidth: isMobile ? '100%' : '360px' }}>
            <div className="ff-card" style={{ position: isMobile ? 'static' : 'sticky', top: 72 }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 700 }}>{fmt(raised)}</span>
                  <span style={{ fontSize: 13, color: T.green, fontWeight: 600 }}>{progress}%</span>
                </div>
                <div style={{ fontSize: 13, color: T.gray500, marginBottom: 8 }}>dari target {fmt(target)}</div>
                <ProgressBar value={progress} height={8} />
              </div>

              <div style={{ height: 1, background: T.gray200, margin: '1rem 0' }} />

              {[
                ['Return', `${returnRate}${typeof returnRate === 'number' ? '%' : ''}/tahun`],
                ['Tenor', `${tenor}${typeof tenor === 'number' ? ' bulan' : ''}`],
                ['Est. cicilan/bln', monthly ? fmt(monthly) : '—'],
                ['Risiko', c.risk || c.risk_level || '—'],
                ['Investor', `${c.investor_count ?? investors.length} orang`],
                ['Deadline', c.deadline ? new Date(c.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: T.gray500 }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}

              <div style={{ height: 1, background: T.gray200, margin: '1rem 0' }} />

              {role === 'investor' && c.status === 'active' ? (
                <>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Jumlah investasi (Rp)</label>
                  <input
                    type="number"
                    value={amount}
                    min={100000}
                    step={50000}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 14, border: `1px solid ${T.gray200}`, borderRadius: 6, outline: 'none', boxSizing: 'border-box', marginBottom: '0.75rem' }}
                  />
                  {amount >= 100000 && (
                    <div style={{ background: T.greenLight, border: `1px solid ${T.green}20`, borderRadius: 6, padding: '10px 12px', marginBottom: '0.75rem', fontSize: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: T.gray700 }}>Estimasi total return</span>
                        <span style={{ fontWeight: 700, color: T.green }}>{fmt(Math.round(amount * (1 + parseFloat(returnRate) / 100)))}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ color: T.gray500 }}>Return per bulan</span>
                        <span style={{ color: T.green }}>{tenor ? fmt(Math.round((amount * (1 + parseFloat(returnRate) / 100)) / parseInt(tenor))) : '—'}</span>
                      </div>
                    </div>
                  )}

                  {amount < 100000 ? (
                    <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 8, textAlign: 'center' }}>⚠️ Minimum investasi Rp 100.000</p>
                  ) : (
                    <PaymentButton
                      type="investment"
                      campaignId={c.id}
                      amount={amount}
                      label="💳 Investasi Sekarang"
                      style={{ width: '100%', padding: '12px', fontSize: 15 }}
                      onSuccess={() => {
                        // Memicu penarikan ulang data agar chart progress ter-update instan setelah modal Midtrans ditutup
                        fetchDetail();
                      }}
                    />
                  )}

                  <p style={{ fontSize: 11, color: T.gray500, textAlign: 'center', marginTop: 8 }}>Minimum Rp 100.000 · Pembayaran via Midtrans</p>
                </>
              ) : role === 'investor' ? (
                <div style={{ textAlign: 'center', padding: '1rem 0', fontSize: 14, color: T.gray500 }}>Kampanye ini sudah tidak menerima investasi.</div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0', fontSize: 13, color: T.gray500 }}>Login sebagai investor untuk berinvestasi.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
