import { T } from '../../tokens';
import ProgressBar from '../components/ProgressBar';
import { campaigns, umkmTransactions } from '../../dummyData';
import { fmt, pct } from '../../../utils/format';

const campaign = campaigns[0]; // Warung Mak Cik Ijah

const MILESTONES = [
  { label: 'Dokumen diserahkan', done: true },
  { label: 'Verifikasi lapangan', done: true },
  { label: 'Campaign tayang', done: true },
  { label: 'Target tercapai', done: false },
  { label: 'Dana dicairkan', done: false },
];

const SIDEBAR_LINKS = [
  { icon: '⊡', label: 'Ringkasan' },
  { icon: '◈', label: 'Campaign saya' },
  { icon: '⊞', label: 'Transaksi' },
  { icon: '◎', label: 'Laporan' },
];

export default function UMKMDashboard() {
  const progress = pct(campaign.raised, campaign.target);

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
      {/* Sidebar */}
      <aside className="ff-sidebar-wrapper" style={{ width: 240, borderRight: T.border, padding: '1.5rem 1rem', background: T.white }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: 32, marginBottom: '0.5rem' }}>{campaign.img}</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{campaign.name}</div>
          <div style={{ fontSize: 12, color: T.gray500 }}>{campaign.location}</div>
          <span className="ff-badge ff-badge-green" style={{ marginTop: 6 }}>
            {campaign.sector}
          </span>
        </div>
        {SIDEBAR_LINKS.map((l) => (
          <button key={l.label} className="ff-sidebar-link">
            <span style={{ marginRight: 8 }}>{l.icon}</span> {l.label}
          </button>
        ))}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem', background: T.gray50, overflow: 'auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 22, fontWeight: 600 }}>Dashboard UMKM</h2>
          <p style={{ fontSize: 14, color: T.gray500 }}>Pantau perkembangan campaign &amp; pendanaan kamu.</p>
        </div>

        {/* Campaign status card */}
        <div className="ff-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 16 }}>{campaign.name}</h3>
              <p style={{ fontSize: 13, color: T.gray500, marginTop: 2 }}>{campaign.desc}</p>
            </div>
            <span className="ff-badge ff-badge-green">Campaign Aktif</span>
          </div>

          {/* Mini stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 12, marginBottom: '1.25rem' }}>
            {[
              ['Dana terkumpul', fmt(campaign.raised)],
              ['Target', fmt(campaign.target)],
              ['Investor', `${campaign.investors} orang`],
              ['Sisa waktu', '18 hari'],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: 12, background: T.gray50, borderRadius: 8, border: T.border }}>
                <div style={{ fontSize: 11, color: T.gray500, marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <ProgressBar value={progress} height={8} showLabel label="Progress pendanaan" />
        </div>

        {/* Milestones */}
        <div className="ff-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Tahapan proses</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {MILESTONES.map((m, i) => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < MILESTONES.length - 1 ? T.border : 'none' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: m.done ? T.green : T.gray200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {m.done ? <span style={{ color: T.white, fontSize: 12 }}>✓</span> : <span style={{ color: T.gray500, fontSize: 11 }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 14, color: m.done ? T.gray900 : T.gray500, fontWeight: m.done ? 500 : 400 }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="ff-card">
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Dana masuk terbaru</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="ff-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Keterangan</th>
                  <th>Jumlah</th>
                  <th>Jenis</th>
                </tr>
              </thead>
              <tbody>
                {umkmTransactions.map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13, color: T.gray500 }}>{t.date}</td>
                    <td style={{ fontWeight: 500 }}>{t.investor}</td>
                    <td style={{ fontWeight: 600, color: t.status === 'Masuk' ? T.green : T.gray700 }}>
                      {t.status === 'Masuk' ? '+' : '−'}
                      {fmt(t.amount)}
                    </td>
                    <td>
                      <span className={`ff-badge ${t.status === 'Masuk' ? 'ff-badge-green' : 'ff-badge-amber'}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
