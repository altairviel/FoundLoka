import { useState } from "react";
import { T } from "../styles/tokens";
import CampaignCard from "../components/CampaignCard";
import ProgressBar from "../components/ProgressBar";
import { campaigns } from "../styles/dummyData";
import { fmt, pct } from "../utils/format";

const SECTOR_FILTERS = ["Semua", "Kuliner", "Fashion", "Agrikultur", "Kerajinan", "Perikanan"];

function CampaignDetail({ c, onBack }) {
  const progress = pct(c.raised, c.target);

  return (
    <div style={{ background: T.gray50, minHeight: "calc(100vh - 56px)" }}>
      <div className="ff-container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <button className="ff-btn ff-btn-sm" style={{ marginBottom: "1.5rem" }} onClick={onBack}>
          ← Kembali
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "start" }}>
          {/* Left column */}
          <div>
            <div style={{ background: T.white, border: T.border, borderRadius: T.radiusMd, padding: "2rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <div style={{ fontSize: 48 }}>{c.img}</div>
                <div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                    <span className="ff-badge ff-badge-gray">{c.sector}</span>
                    {c.verified && <span className="ff-badge ff-badge-blue">✓ Terverifikasi</span>}
                  </div>
                  <h1 style={{ fontSize: 22, fontWeight: 700 }}>{c.name}</h1>
                  <p style={{ color: T.gray500, fontSize: 14 }}>📍 {c.location}</p>
                </div>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: T.gray700 }}>
                {c.desc} Proses produksi saat ini masih manual dan butuh modal untuk meningkatkan kapasitas dan kualitas output.
              </p>
            </div>

            {/* Penggunaan dana */}
            <div className="ff-card" style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Penggunaan dana</h3>
              {[
                ["Alat produksi",    "50%", 50],
                ["Modal kerja",      "30%", 30],
                ["Biaya operasional","20%", 20],
              ].map(([k, v, pv]) => (
                <div key={k} style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{k}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{v}</span>
                  </div>
                  <ProgressBar value={pv} />
                </div>
              ))}
            </div>

            {/* Profil pemilik */}
            <div className="ff-card">
              <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Profil pemilik</h3>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 600, color: T.green }}>
                  M
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Mak Cik Ijah</div>
                  <div style={{ fontSize: 13, color: T.gray500 }}>Pemilik usaha · 12 tahun pengalaman</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div>
            <div className="ff-card" style={{ position: "sticky", top: 72 }}>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 700 }}>{fmt(c.raised)}</span>
                  <span style={{ fontSize: 13, color: T.green, fontWeight: 600 }}>{progress}%</span>
                </div>
                <div style={{ fontSize: 13, color: T.gray500, marginBottom: 8 }}>dari target {fmt(c.target)}</div>
                <ProgressBar value={progress} height={8} />
              </div>

              <div className="ff-divider" />

              {[
                ["Return",   `${c.return}/tahun`],
                ["Tenor",    c.tenor],
                ["Risiko",   c.risk],
                ["Investor", `${c.investors} orang`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: T.gray500 }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}

              <div className="ff-divider" />

              <label className="ff-label">Jumlah investasi</label>
              <input className="ff-input" type="number" defaultValue="500000" placeholder="Min. 100.000" style={{ marginBottom: "0.75rem" }} />
              <button className="ff-btn ff-btn-primary" style={{ width: "100%", padding: 10, fontSize: 15 }}>
                Investasi Sekarang
              </button>
              <p style={{ fontSize: 12, color: T.gray500, textAlign: "center", marginTop: 8 }}>
                Minimum Rp 100.000 · Dana aman &amp; terlindungi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignPage() {
  const [filter,   setFilter]   = useState("Semua");
  const [selected, setSelected] = useState(null);

  if (selected) {
    return <CampaignDetail c={selected} onBack={() => setSelected(null)} />;
  }

  const filtered = filter === "Semua" ? campaigns : campaigns.filter((c) => c.sector === filter);

  return (
    <div style={{ background: T.gray50, minHeight: "calc(100vh - 56px)" }}>
      <div style={{ background: T.white, borderBottom: T.border, padding: "2rem 0" }}>
        <div className="ff-container">
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Campaign UMKM</h1>
          <p style={{ color: T.gray500, fontSize: 14 }}>{campaigns.length} campaign aktif · semua telah diverifikasi tim lapangan</p>
          <div style={{ display: "flex", gap: 6, marginTop: "1.25rem", flexWrap: "wrap" }}>
            {SECTOR_FILTERS.map((s) => (
              <button
                key={s}
                className="ff-btn ff-btn-sm"
                style={{
                  background:   filter === s ? T.green : T.white,
                  color:        filter === s ? T.white : T.gray700,
                  borderColor:  filter === s ? T.green : T.gray300,
                }}
                onClick={() => setFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ff-container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: "1rem" }}>
          {filtered.map((c) => (
            <CampaignCard key={c.id} c={c} onClick={() => setSelected(c)} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: T.gray500 }}>
            Belum ada campaign di sektor ini.
          </div>
        )}
      </div>
    </div>
  );
}