// client/styles/src/pages/Campaignpage.jsx
import { useState, useEffect } from 'react';
import { T } from '../../tokens';
import CampaignCard from '../components/CampaignCard';
import { getCampaigns } from '../services/campaign';
import { fmt } from '../utils/format';

const CATEGORIES = ['Semua', 'Kuliner', 'Fashion', 'Agrikultur', 'Kerajinan', 'Perikanan', 'Teknologi'];

function normalizeCampaign(c) {
  return {
    ...c,
    name: c.name || c.title || '—',
    sector: c.sector || c.category || '—',
    raised: parseFloat(c.raised ?? c.collected_amount ?? 0),
    target: parseFloat(c.target ?? c.target_amount ?? 1),
    return: c.return ?? (c.return_rate != null ? `${c.return_rate}%` : '—'),
    tenor: c.tenor ?? (c.tenor_months != null ? `${c.tenor_months} bln` : '—'),
    investors: c.investors ?? c.investor_count ?? 0,
    desc: c.desc || c.description || '',
    img: c.img || c.icon || '🏪',
    risk: c.risk || c.risk_level || '—',
    location: c.location || c.address || '—',
    owner_name: c.owner_name || 'Pemilik Usaha',
  };
}

export default function CampaignPage({ role, setPage, setSelectedCampaign }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [useRadius, setUseRadius] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  // Ambil koordinat user untuk filter radius
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
  }, []);

  // Fetch campaigns dari backend
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (category !== 'Semua') params.category = category;
        if (useRadius && userCoords) {
          params.lat = userCoords.lat;
          params.lng = userCoords.lng;
          params.radius = 5;
        }
        const query = new URLSearchParams(params).toString();
        const res = await getCampaigns(query ? `?${query}` : '');
        const raw = Array.isArray(res.data?.campaigns) ? res.data.campaigns : Array.isArray(res.data) ? res.data : [];
        setCampaigns(raw.map(normalizeCampaign));
      } catch (err) {
        setError('Gagal memuat kampanye. Periksa koneksi Anda.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [category, useRadius, userCoords]);

  const filtered = campaigns.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()));

  const handleCardClick = (c) => {
    setSelectedCampaign(c);
    setPage('campaignDetail');
  };

  return (
    <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)' }}>
      {/* Header */}
      <div style={{ background: T.white, borderBottom: T.border, padding: '2rem 0' }}>
        <div className="ff-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Kampanye UMKM</h1>
              <p style={{ color: T.gray500, fontSize: 14 }}>{loading ? 'Memuat...' : `${filtered.length} kampanye aktif · semua telah diverifikasi`}</p>
            </div>
            {/* Toggle view grid / map */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['grid', 'map'].map((m) => (
                <button
                  key={m}
                  className="ff-btn ff-btn-sm"
                  onClick={() => setViewMode(m)}
                  style={{
                    background: viewMode === m ? T.green : T.white,
                    color: viewMode === m ? T.white : T.gray700,
                    borderColor: viewMode === m ? T.green : T.gray300,
                  }}
                >
                  {m === 'grid' ? '⊞ Grid' : '📍 Peta'}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.gray500, fontSize: 14 }}>🔍</span>
              <input
                type="text"
                placeholder="Cari nama usaha, deskripsi, lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  border: `1px solid ${T.gray200}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: T.white,
                }}
              />
            </div>

            {/* Toggle radius */}
            <button
              className="ff-btn ff-btn-sm"
              onClick={() => setUseRadius(!useRadius)}
              style={{
                background: useRadius ? T.green : T.white,
                color: useRadius ? T.white : T.gray700,
                borderColor: useRadius ? T.green : T.gray300,
              }}
              title={userCoords ? 'Filter dalam radius 5km dari lokasi Anda' : 'Izinkan lokasi untuk menggunakan fitur ini'}
            >
              📍 {useRadius ? 'Radius 5km ✓' : 'Radius 5km'}
            </button>
          </div>

          {/* Filter kategori */}
          <div style={{ display: 'flex', gap: 6, marginTop: '1rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="ff-btn ff-btn-sm"
                onClick={() => setCategory(cat)}
                style={{
                  background: category === cat ? T.green : T.white,
                  color: category === cat ? T.white : T.gray700,
                  borderColor: category === cat ? T.green : T.gray300,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="ff-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1.5rem' }}>⚠️ {error}</div>}

        {viewMode === 'map' ? (
          <MapView campaigns={filtered} onCardClick={handleCardClick} />
        ) : loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ height: 300, background: T.gray100, borderRadius: 10, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: T.gray500 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Kampanye tidak ditemukan</div>
            <div style={{ fontSize: 14 }}>Coba ubah kata kunci atau filter kategori</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1rem' }}>
            {filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} onClick={() => handleCardClick(c)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Map View sederhana (list dengan koordinat) ──
function MapView({ campaigns, onCardClick }) {
  const withCoords = campaigns.filter((c) => c.lat && c.lng);
  return (
    <div>
      <div
        style={{
          background: T.gray100,
          border: T.border,
          borderRadius: 10,
          height: 360,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          color: T.gray500,
          fontSize: 14,
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 32 }}>🗺️</div>
        <div style={{ fontWeight: 600 }}>Tampilan Peta</div>
        <div style={{ fontSize: 13 }}>Integrasikan Leaflet/Mapbox di sini menggunakan koordinat kampanye</div>
        <div style={{ fontSize: 12, color: T.gray500 }}>{withCoords.length} kampanye memiliki koordinat</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1rem' }}>
        {campaigns.map((c) => (
          <CampaignCard key={c.id} campaign={c} onClick={() => onCardClick(c)} />
        ))}
      </div>
    </div>
  );
}
