import { T } from '../../../../tokens';
import { fmt, pct } from '../../../utils/format'; // ✅ sesuai format.js teman kamu

export default function CampaignCard({ campaign, onClick }) {
  const progress = pct(parseFloat(campaign.collected_amount || 0), parseFloat(campaign.target_amount || 1));

  return (
    <div
      onClick={onClick}
      style={{ background: T.white, border: T.border, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Gambar kampanye */}
      <div style={{ height: 160, background: T.gray100, position: 'relative', overflow: 'hidden' }}>
        {campaign.image_url ? (
          <img src={campaign.image_url} alt={campaign.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏪</div>
        )}
        <span style={{ position: 'absolute', top: 12, left: 12, background: T.white, border: T.border, borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 500, color: T.gray700 }}>{campaign.category || 'Umum'}</span>
      </div>

      {/* Isi card */}
      <div style={{ padding: '1rem' }}>
        <div style={{ fontSize: 12, color: T.gray500, marginBottom: 4 }}>{campaign.owner_name}</div>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{campaign.title}</h3>

        {/* Progress bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 6, background: T.gray100, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: T.green, borderRadius: 99, transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: T.gray500 }}>
            <span>{fmt(campaign.collected_amount)} terkumpul</span>
            <span>{Math.min(progress, 100)}%</span>
          </div>
        </div>

        {/* Return dan target */}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: T.border }}>
          <div>
            <div style={{ fontSize: 11, color: T.gray500 }}>Return</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.green }}>
              {campaign.return_rate}% / {campaign.tenor_months} bln
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: T.gray500 }}>Target</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{fmt(campaign.target_amount)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
