import { T } from "../styles/tokens";

export default function Navbar({ role, setRole, page, setPage }) {
  // Susun menu secara dinamis berdasarkan role
  const NAV_LINKS = [
    { id: "landing", label: "Beranda" },
    // Jika role = investor, tampilkan menu Dashboard Investor. Jika tidak, tampilkan Dashboard UMKM.
    ...(role === "investor"
      ? [{ id: "investor", label: "Dashboard Investor" }]
      : [{ id: "umkm",     label: "Dashboard UMKM" }]),
    { id: "campaign",  label: "Campaign" },
    { id: "analytics", label: "Analitik" },
  ];

  return (
    <nav className="ff-nav">
      {/* Logo */}
      <div className="ff-nav-logo" style={{ cursor: "pointer" }} onClick={() => setPage("landing")}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2"  y="8" width="8" height="14" rx="2" fill={T.green} />
          <rect x="13" y="4" width="9" height="18" rx="2" fill={T.greenDark} opacity="0.8" />
        </svg>
        Folk<span>Fund</span>
      </div>

      {/* Links Dinamis */}
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

      {/* Area CTA & Tombol Keluar */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {role === "investor" ? (
          <button className="ff-btn ff-btn-primary ff-btn-sm" onClick={() => setPage("investor")}>
            Mulai Investasi
          </button>
        ) : (
          <button className="ff-btn ff-btn-primary ff-btn-sm" onClick={() => setPage("umkm")}>
            Kelola Campaign
          </button>
        )}
        
        {/* Tombol Logout */}
        <button
          className="ff-btn ff-btn-sm"
          style={{ background: "#fde8e8", color: "#8b1a1a", borderColor: "#fde8e8" }}
          onClick={() => {
            setRole(null); // Reset role ke null untuk kembali ke halaman login
          }}
        >
          Keluar
        </button>
      </div>
    </nav>
  );
}