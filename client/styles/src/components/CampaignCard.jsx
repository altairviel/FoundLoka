import { T } from '../../tokens';
import { fmt, pct } from '../utils/format';

export default function CampaignCard({ campaign, onClick }) {
  const c = campaign;

  if (!c) {
    console.trace('🔍 KETEMU! Pelaku yang ngirim data undefined adalah:');
    return <div style={{ padding: '1rem', color: 'red', border: '1px dashed red' }}>Data tidak valid</div>;
  }

  const progress = pct(c.raised, c.target);
  return (
    <div className="ff-card" style={{ cursor: 'pointer' }} onClick={onClick}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: 28 }}>{c.img}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className="ff-badge ff-badge-gray">{c.sector}</span>
          {c.risk === 'Rendah' && <span className="ff-badge ff-badge-green">{c.risk}</span>}
          {c.risk === 'Menengah' && <span className="ff-badge ff-badge-amber">{c.risk}</span>}
          {c.risk === 'Tinggi' && <span className="ff-badge ff-badge-red">{c.risk}</span>}
        </div>
      </div>

      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{c.name}</div>
      <div style={{ fontSize: 12, color: T.gray500, marginBottom: '0.75rem' }}>📍 {c.location}</div>
      <p style={{ fontSize: 13, color: T.gray700, lineHeight: 1.6, marginBottom: '1rem' }}>{c.desc}</p>

      {/* Progress */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(c.raised)}</span>
          <span style={{ fontSize: 12, color: T.gray500 }}>{progress}% dari target</span>
        </div>
        <div className="ff-progress">
          <div className="ff-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: '1rem', paddingTop: '0.75rem', borderTop: T.border }}>
        {[
          ['Target', fmt(c.target)],
          ['Return', c.return + '/th'],
          ['Tenor', c.tenor],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 11, color: T.gray500, marginBottom: 2 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: T.border }}>
        <span style={{ fontSize: 12, color: T.gray500 }}>{c.investors} investor</span>
        {progress >= 100 ? (
          <span className="ff-badge ff-badge-gray">Terpenuhi</span>
        ) : (
          <button
            className="ff-btn ff-btn-primary ff-btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Investasi Sekarang
          </button>
        )}
      </div>
    </div>
  );
}
