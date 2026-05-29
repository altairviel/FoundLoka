import { T } from "../styles/tokens";

const NAV_LINKS = [
  { id: "landing",   label: "Beranda" },
  { id: "investor",  label: "Dashboard Investor" },
  { id: "umkm",      label: "Dashboard UMKM" },
  { id: "campaign",  label: "Campaign" },
  { id: "analytics", label: "Analitik" },
];

export default function Navbar({ page, setPage }) {
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

      {/* Links */}
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

      {/* CTA */}
      <button
        className="ff-btn ff-btn-primary ff-btn-sm"
        onClick={() => setPage("investor")}
      >
        Mulai Investasi
      </button>
    </nav>
  );
}