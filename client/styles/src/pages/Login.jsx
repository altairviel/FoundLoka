import { T } from "../styles/tokens";

export default function Login({ setRole, setPage }) {
  const handleLogin = (selectedRole) => {
    setRole(selectedRole); // Simpan role yang dipilih
    setPage("landing");    // Arahkan ke halaman Beranda setelah login
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: T.gray50, padding: "2rem" }}>
      <div className="ff-card" style={{ maxWidth: 400, width: "100%", textAlign: "center", padding: "3rem 2rem" }}>
        <div style={{ fontSize: 48, marginBottom: "1rem" }}>🌱</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: "0.5rem" }}>Selamat Datang</h1>
        <p style={{ color: T.gray500, fontSize: 14, marginBottom: "2.5rem", lineHeight: 1.6 }}>
          Pilih peran Anda untuk masuk ke dalam ekosistem FolkFund.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button
            className="ff-btn ff-btn-primary"
            style={{ padding: "12px", fontSize: 15 }}
            onClick={() => handleLogin("investor")}
          >
            Masuk sebagai Investor
          </button>
          <button
            className="ff-btn"
            style={{ padding: "12px", fontSize: 15, background: T.white, border: `2px solid ${T.green}`, color: T.green }}
            onClick={() => handleLogin("umkm")}
          >
            Masuk sebagai UMKM
          </button>
        </div>
      </div>
    </div>
  );
}