import { useEffect, useState } from 'react';
import { getMyInstallments } from '../services/installment';
import PaymentButton from '../components/PaymentButton';
import { fmt } from '../utils/format';
import { T } from '../../tokens';

const STATUS_CONFIG = {
  paid: { label: 'Lunas', bg: '#dcfce7', color: '#16a34a' },
  late: { label: 'Terlambat', bg: '#fee2e2', color: '#dc2626' },
  pending: { label: 'Belum', bg: '#fef9c3', color: '#ca8a04' },
};

export default function Installments({ onBack }) {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInstallments = () => {
    setLoading(true);
    getMyInstallments()
      .then(({ data }) => setInstallments(data.installments || []))
      .catch(() => setError('Gagal memuat jadwal cicilan'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInstallments();
  }, []);

  // Kelompokkan cicilan per kampanye
  const grouped = installments.reduce((acc, ins) => {
    const key = ins.campaign_id;
    if (!acc[key]) {
      acc[key] = {
        campaign_title: ins.campaign_title,
        items: [],
      };
    }
    acc[key].items.push(ins);
    return acc;
  }, {});

  // Hitung summary
  const total = installments.length;
  const paid = installments.filter((i) => i.status === 'paid').length;
  const late = installments.filter((i) => i.status === 'late').length;
  const pending = installments.filter((i) => i.status === 'pending').length;

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: T.gray500 }}>Memuat jadwal cicilan...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: T.gray500 }}>
            ←
          </button>
        )}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Jadwal Cicilan</h1>
          <p style={{ fontSize: 13, color: T.gray500, margin: 0 }}>Kelola pembayaran cicilan semua kampanye kamu</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '2rem' }}>
        {[
          { label: 'Total Cicilan', value: total, color: T.gray700 },
          { label: 'Sudah Lunas', value: paid, color: '#16a34a' },
          { label: 'Terlambat', value: late, color: '#dc2626' },
        ].map((s) => (
          <div key={s.label} style={{ background: T.white, border: T.border, borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 600, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: T.gray500, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: 8, marginBottom: '1rem', fontSize: 13 }}>{error}</div>}

      {/* Tidak ada cicilan */}
      {!loading && installments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: T.gray500 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p>Belum ada jadwal cicilan.</p>
          <p style={{ fontSize: 13 }}>Cicilan akan muncul setelah kampanye kamu fully funded dan admin mencairkan dana.</p>
        </div>
      )}

      {/* List cicilan per kampanye */}
      {Object.entries(grouped).map(([campaignId, group]) => (
        <div key={campaignId} style={{ marginBottom: '2rem' }}>
          {/* Judul kampanye */}
          <h2 style={{ fontSize: 15, fontWeight: 600, color: T.gray700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: T.border }}>🏪 {group.campaign_title}</h2>

          {/* Daftar cicilan */}
          {group.items.map((ins) => {
            const cfg = STATUS_CONFIG[ins.status] || STATUS_CONFIG.pending;

            return (
              <div
                key={ins.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                  padding: '1rem 1.25rem',
                  background: T.white,
                  border: ins.status === 'late' ? '1px solid #fca5a5' : T.border,
                  borderRadius: 10,
                  marginBottom: 8,
                }}
              >
                {/* Info cicilan */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Cicilan Bulan ke-{ins.month_number}</div>
                  <div style={{ fontSize: 12, color: T.gray500, marginTop: 2 }}>
                    Jatuh tempo:{' '}
                    {new Date(ins.due_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: T.green, marginTop: 4 }}>{fmt(ins.amount)}</div>
                </div>

                {/* Status atau tombol bayar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Badge status */}
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      background: cfg.bg,
                      color: cfg.color,
                    }}
                  >
                    {cfg.label}
                  </span>

                  {/* Tombol bayar — hanya muncul kalau belum lunas */}
                  {ins.status !== 'paid' && (
                    <PaymentButton
                      type="installment"
                      installmentId={ins.id}
                      label={ins.status === 'late' ? 'Bayar Sekarang!' : 'Bayar'}
                      style={{
                        padding: '6px 16px',
                        fontSize: 13,
                        background: ins.status === 'late' ? '#dc2626' : T.green,
                      }}
                      onSuccess={() => {
                        // Refresh data setelah bayar
                        fetchInstallments();
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
