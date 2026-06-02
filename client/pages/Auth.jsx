import { useState } from "react";
import { T } from "../styles/tokens";

export default function Auth({ setRole, setPage }) {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState("investor");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulasi login/register berhasil
    // Jika register, gunakan role yang dipilih. Jika login, asumsikan dia masuk sebagai role terakhirnya.
    setRole(selectedRole); 
    setPage("landing");
  };

  const socialBtnStyle = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    width: "100%", padding: "10px", background: T.white, border: T.border,
    borderRadius: "6px", fontSize: "14px", fontWeight: 500, color: T.gray700,
    marginBottom: "0.5rem", cursor: "pointer", transition: "all 0.2s"
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.gray50 }}>
      {/* Kiri: Ilustrasi / Branding */}
      <div style={{ flex: 1, background: T.greenDark, color: T.white, padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img 
              src="/Folk Fund Login.png" 
              alt="FolkFund Logo" 
              style={{ height: "48px", objectFit: "contain" }} 
            />
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 600, marginTop: "4rem", lineHeight: 1.2 }}>
            Membangun ekonomi,<br />satu UMKM pada satu waktu.
          </h1>
        </div>
        <div style={{ fontSize: 13, color: T.greenLight, opacity: 0.8 }}>
          © 2026 FolkFund. Terdaftar dan diawasi oleh OJK.
        </div>
      </div>

      {/* Kanan: Form Auth */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 400, width: "100%" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: "0.5rem" }}>
            {isRegister ? "Buat Akun Baru" : "Selamat Datang Kembali"}
          </h2>
          <p style={{ color: T.gray500, fontSize: 14, marginBottom: "2rem" }}>
            {isRegister ? "Daftar untuk mulai berinvestasi atau mencari pendanaan." : "Silakan masuk untuk mengakses dashboard Anda."}
          </p>

          {/* Social Logins */}
          <div style={{ marginBottom: "1.5rem" }}>
            <button style={socialBtnStyle}>🌐 Lanjutkan dengan Google</button>
            <button style={socialBtnStyle}>📘 Lanjutkan dengan Facebook</button>
            <button style={socialBtnStyle}>💼 Lanjutkan dengan LinkedIn</button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0", color: T.gray300 }}>
            <div style={{ flex: 1, height: 1, background: T.gray200 }} />
            <span style={{ fontSize: 12 }}>ATAU DENGAN USERNAME</span>
            <div style={{ flex: 1, height: 1, background: T.gray200 }} />
          </div>

          {/* Form Utama */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label className="ff-label">Username</label>
              <input className="ff-input" type="text" placeholder="Masukkan username Anda" required />
            </div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="ff-label">Password</label>
              <input className="ff-input" type="password" placeholder="••••••••" required />
            </div>

            {/* Pilihan Role (Hanya muncul saat Register) */}
            {isRegister && (
              <div style={{ marginBottom: "2rem" }}>
                <label className="ff-label">Saya ingin bergabung sebagai:</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
                  <div 
                    onClick={() => setSelectedRole("investor")}
                    style={{ border: `2px solid ${selectedRole === "investor" ? T.green : T.gray200}`, background: selectedRole === "investor" ? T.greenLight : T.white, padding: "1rem", borderRadius: "8px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>📈</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: selectedRole === "investor" ? T.greenDark : T.gray700 }}>Investor</div>
                  </div>
                  <div 
                    onClick={() => setSelectedRole("umkm")}
                    style={{ border: `2px solid ${selectedRole === "umkm" ? T.green : T.gray200}`, background: selectedRole === "umkm" ? T.greenLight : T.white, padding: "1rem", borderRadius: "8px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>🏪</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: selectedRole === "umkm" ? T.greenDark : T.gray700 }}>Campaign UMKM</div>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="ff-btn ff-btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15 }}>
              {isRegister ? "Daftar Sekarang" : "Masuk"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "2rem", fontSize: 14, color: T.gray500 }}>
            {isRegister ? "Sudah punya akun? " : "Belum terdaftar? "}
            <span 
              style={{ color: T.green, fontWeight: 600, cursor: "pointer" }} 
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Masuk di sini" : "Daftar sekarang"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}