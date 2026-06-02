import { T } from "../styles/tokens";

export default function Navbar({ role, setRole, page, setPage }) {
  const NAV_LINKS = [
    { id: "landing", label: "Beranda" },
    ...(role === "investor"
      ? [{ id: "investor", label: "Dashboard Investor" }]
      : [{ id: "umkm",     label: "Dashboard UMKM" }]),
    { id: "campaign",  label: "Campaign" },
    { id: "analytics", label: "Analitik" },
  ];

  return (
    <nav className="ff-nav">
      {/* Logo */}
      {/* Logo */}
      <div className="ff-nav-logo" style={{ cursor: "pointer" }} onClick={() => setPage("landing")}>
        <img 
          src="/Folk Fund.png" 
          alt="FolkFund Logo" 
          style={{ height: "32px", objectFit: "contain" }} 
        />
      </div>

      <div className="ff-nav-links">
        {NAV_LINKS.map((l) => (
          <button
            key={l.id}
            className={`ff-nav-link${page === l.id ? " active" : ""}`}
            onClick={() => setPage(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {/* Tombol Akses Profil */}
        <button 
          className="ff-btn" 
          style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, borderColor: T.green, color: T.greenDark }} 
          onClick={() => setPage("profile")}
        >
          🧑‍🦱 Profil Saya
        </button>

        <button
          className="ff-btn ff-btn-sm"
          style={{ background: "#fde8e8", color: "#8b1a1a", borderColor: "#fde8e8" }}
          onClick={() => {
            setRole(null);
          }}
        >
          Keluar
        </button>
      </div>
    </nav>
  );
}