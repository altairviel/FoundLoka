import { T } from "../styles/tokens";
import StatCard from "../components/StatCard";

export default function Profile({ role }) {
  return (
    <div style={{ background: T.gray50, minHeight: "calc(100vh - 56px)", padding: "2rem 0" }}>
      <div className="ff-container">
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: "1.5rem" }}>Profil Pengguna</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", alignItems: "start" }}>
          
          {/* Kolom Utama (Kiri) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Header Profil */}
            <div className="ff-card" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, border: `2px solid ${T.green}` }}>
                {/* Mengikuti aturan penamaan aset menggunakan lowercase "assets" */}
                <img src="/assets/avatar.png" alt="Avatar 🧑‍🦱" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "none" }} onError={(e) => e.target.style.display = 'none'} />
                🧑‍🦱
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700 }}>Maradu Winner Laurensius</h2>
                  <span className="ff-badge ff-badge-blue">✓ Terverifikasi</span>
                </div>
                <p style={{ color: T.gray500, fontSize: 14, marginBottom: 8 }}>
                  Mahasiswa Teknik Informatika · Universitas Mikroskil
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="ff-badge ff-badge-gray">Full-Stack Web Dev</span>
                  <span className="ff-badge ff-badge-gray">IoT Enthusiast</span>
                  <span className="ff-badge ff-badge-green">
                    {role === "investor" ? "Investor Aktif" : "Pemilik Campaign"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sorotan Proyek & Keahlian */}
            <div className="ff-card">
              <h3 style={{ fontWeight: 600, marginBottom: "1.25rem" }}>Latar Belakang & Portofolio</h3>
              <p style={{ fontSize: 14, color: T.gray700, lineHeight: 1.7, marginBottom: "1.5rem" }}>
                Pengembang web dan sistem terintegrasi dengan ketertarikan kuat pada Data Science dan komputasi statistik. Memiliki pengalaman mengembangkan backend Node.js & Express, serta eksplorasi perangkat keras menggunakan mikrokontroler ESP32.
              </p>
              
              <h4 style={{ fontSize: 13, color: T.gray500, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 600 }}>Proyek Terhubung</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ border: T.border, padding: "1rem", borderRadius: "8px" }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Respiro (IoT)</div>
                  <div style={{ fontSize: 13, color: T.gray500 }}>Alat biofeedback rehabilitasi pernapasan menggunakan ESP32 & HC-SR04.</div>
                </div>
                <div style={{ border: T.border, padding: "1rem", borderRadius: "8px" }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Sistem Manajemen Kos</div>
                  <div style={{ fontSize: 13, color: T.gray500 }}>Aplikasi manajemen kos berbasis React dan REST API.</div>
                </div>
              </div>
            </div>

          </div>

          {/* Kolom Samping (Kanan) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Info Akun / Keamanan */}
            <div className="ff-card">
              <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Informasi Akun</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.gray500 }}>NIM / ID</span>
                  <span style={{ fontWeight: 500 }}>241112149</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.gray500 }}>Email</span>
                  <span style={{ fontWeight: 500 }}>maradu@mikroskil.ac.id</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.gray500 }}>Keamanan</span>
                  <span style={{ color: T.green, fontWeight: 500 }}>2FA Aktif</span>
                </div>
              </div>
              <div className="ff-divider" style={{ margin: "1rem 0" }} />
              <button className="ff-btn" style={{ width: "100%", fontSize: 13 }}>Edit Profil</button>
            </div>

            {/* Statistik Singkat */}
            <StatCard 
              label={role === "investor" ? "Level Keanggotaan" : "Status Campaign"} 
              value={role === "investor" ? "Gold Tier" : "Sedang Berjalan"} 
              accent 
            />

          </div>
        </div>
      </div>
    </div>
  );
}