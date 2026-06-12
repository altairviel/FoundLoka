import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { T } from '../../tokens';
import { getMapData } from '../services/campaign';
import { fmt, pct } from '../utils/format';

// Warna pin berdasarkan status kampanye
const STATUS_COLOR = {
  active: '#16a34a',
  funded: '#2563eb',
  repaying: '#7c3aed',
  done: '#6b7280',
};

const STATUS_LABEL = {
  active: 'Aktif',
  funded: 'Terpenuhi',
  repaying: 'Cicilan Berjalan',
  done: 'Selesai',
};

const CATEGORIES = ['Semua', 'Kuliner', 'Fashion', 'Agrikultur', 'Kerajinan', 'Perikanan', 'Teknologi'];

// Koordinat default — Medan, Indonesia
const DEFAULT_CENTER = [3.5952, 98.6722];
const DEFAULT_ZOOM = 13;

// Komponen Helper untuk menyembuhkan grid peta yang terpotong saat render pindah halaman
function FixMapLayout() {
  const map = useMap();
  useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 200); // Memberi jeda kecil agar komponen selesai dimuat sepenuhnya
    }
  }, [map]);
  return null;
}

export default function MapView() {
  const navigate = useNavigate(); // Hook untuk pindah rute halaman
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setCategory] = useState('Semua');

  useEffect(() => {
    getMapData()
      .then(({ data }) => setLocations(data.locations || []))
      .catch((err) => console.error('Gagal fetch map data:', err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filter berdasarkan kategori yang dipilih
  const filtered = selectedCategory === 'Semua' ? locations : locations.filter((l) => l.category === selectedCategory);

  return (
    <div style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      {/*  Header + Filter  */}
      <div style={{ padding: '1rem 1.5rem', background: T.white, borderBottom: T.border, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Peta Ekonomi Komunitas</h2>
          <p style={{ fontSize: 13, color: T.gray500, margin: 0 }}>{filtered.length} UMKM tersebar</p>
        </div>

        {/* Filter kategori */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 'auto' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '4px 12px',
                fontSize: 12,
                borderRadius: 99,
                border: `1px solid ${selectedCategory === cat ? T.green : T.gray200}`,
                background: selectedCategory === cat ? T.green : T.white,
                color: selectedCategory === cat ? T.white : T.gray700,
                cursor: 'pointer',
                fontWeight: selectedCategory === cat ? 600 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/*  Peta  */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gray500 }}>Memuat peta...</div>
      ) : (
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
            {/* Tile layer — peta OpenStreetMap gratis */}
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Selipkan komponen penyembuh layout di sini */}
            <FixMapLayout />

            {/* Pin tiap kampanye */}
            {/* Pin tiap kampanye */}
            {filtered.map((loc) => {
              // Menampilkan data asli dari database ke console log browser
              console.log('Cek data UMKM dari server:', { nama: loc.title, status: loc.status });

              return (
                <CircleMarker
                  key={loc.id}
                  center={[parseFloat(loc.lat), parseFloat(loc.lng)]}
                  radius={10}
                  pathOptions={{
                    fillColor: STATUS_COLOR[loc.status] || '#6b7280',
                    fillOpacity: 0.85,
                    color: T.white,
                    weight: 2,
                  }}
                >
                  <Popup maxWidth={260}>
                    <div style={{ fontFamily: 'inherit', padding: '4px 0' }}>
                      {/* Badge status */}
                      <span
                        style={{
                          display: 'inline-block',
                          marginBottom: 8,
                          padding: '2px 8px',
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 500,
                          background: (STATUS_COLOR[loc.status] || '#6b7280') + '20',
                          color: STATUS_COLOR[loc.status] || '#6b7280',
                        }}
                      >
                        {STATUS_LABEL[loc.status] || loc.status}
                      </span>

                      {/* Nama kampanye */}
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{loc.title}</div>

                      {/* Kategori */}
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{loc.category || 'Umum'}</div>

                      {/* Progress bar */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 3 }}>
                          <span>Terkumpul</span>
                          <span>{pct(parseFloat(loc.collected_amount || 0), parseFloat(loc.target_amount || 1))}%</span>
                        </div>
                        <div style={{ height: 5, background: '#f1efe8', borderRadius: 99, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              borderRadius: 99,
                              background: STATUS_COLOR[loc.status] || '#16a34a',
                              width: `${Math.min(pct(parseFloat(loc.collected_amount || 0), parseFloat(loc.target_amount || 1)), 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Target */}
                      <div style={{ fontSize: 12, marginBottom: 12 }}>
                        <span style={{ color: '#6b7280' }}>Target: </span>
                        <span style={{ fontWeight: 600 }}>{fmt(loc.target_amount)}</span>
                      </div>

                      {/* Tombol lihat detail */}
                      <button
                        onClick={() => {
                          navigate(`/campaign-detail/${loc.id}`);
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 0',
                          fontSize: 13,
                          fontWeight: 500,
                          borderRadius: 6,
                          border: 'none',
                          background: '#16a34a',
                          color: T.white,
                          cursor: 'pointer',
                        }}
                      >
                        Lihat Detail →
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/*  Legend  */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              right: 12,
              zIndex: 1000,
              background: T.white,
              border: T.border,
              borderRadius: 10,
              padding: '10px 14px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: T.gray500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</div>
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLOR[key] }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
