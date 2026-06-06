import { T } from "../../tokens";

export default function Sidebar({ links, activeTab, setTab, footer }) {
  return (
    <aside
      className="ff-sidebar"
      style={{ background: T.white, display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={{ flex: 1 }}>
        {links.map((l) => (
          <button
            key={l.id ?? l.label}
            className={`ff-sidebar-link${activeTab === l.id ? " active" : ""}`}
            onClick={() => l.id && setTab(l.id)}
          >
            <span style={{ fontSize: 15 }}>{l.icon}</span>
            {l.label}
          </button>
        ))}
      </div>

      {/* Optional footer slot (saldo card) */}
      {footer && (
        <div style={{ paddingTop: "2rem", marginTop: "auto" }}>{footer}</div>
      )}
    </aside>
  );
}