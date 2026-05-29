import { useState } from "react";
import { T } from "../styles/tokens";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import CampaignCard from "../components/CampaignCard";
import { portfolio, transactions, campaigns } from "../styles/dummyData";
import { fmt } from "../utils/format";

const SIDEBAR_LINKS = [
  { id: "overview",  icon: "⊡", label: "Ringkasan" },
  { id: "portfolio", icon: "◈", label: "Portfolio" },
  { id: "explore",   icon: "◎", label: "Jelajahi Campaign" },
  { id: "txn",       icon: "⊞", label: "Transaksi" },
];

function Overview({ setTab }) {
  const totalInvested = portfolio.reduce((a, b) => a + b.invested, 0);
  const totalReturn   = portfolio.reduce((a, b) => a + b.returnVal, 0);
  const activeCount   = portfolio.filter((p) => p.status === "Aktif").length;

  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>Selamat sore, Budi 👋</h2>
        <p style={{ fontSize: 14, color: T.gray500 }}>Jumat, 29 Mei 2026</p>
      </div>

      <div className="ff-grid-4" style={{ marginBottom: "1.5rem" }}>
        <StatCard label="Total Diinvestasikan" value={fmt(totalInvested)} />
        <StatCard label="Total Return"         value={fmt(totalReturn)}   accent />
        <StatCard label="Portfolio Aktif"      value={`${activeCount} campaign`} />
        <StatCard label="ROI Keseluruhan"      value="15,2%" />
      </div>

      <div className="ff-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ fontWeight: 600 }}>Portfolio aktif</h3>
          <button className="ff-btn ff-btn-sm" onClick={() => setTab("portfolio")}>Lihat semua</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="ff-table">
            <thead>
              <tr>
                <th>Campaign</th><th>Modal</th><th>Return</th><th>Status</th><th>Payout berikutnya</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((p) => (
                <tr key={p.campaign}>
                  <td style={{ fontWeight: 500 }}>{p.campaign}</td>
                  <td>{fmt(p.invested)}</td>
                  <td><span style={{ color: T.green, fontWeight: 500 }}>{p.return}</span></td>
                  <td><span className={`ff-badge ${p.status === "Aktif" ? "ff-badge-green" : "ff-badge-gray"}`}>{p.status}</span></td>
                  <td style={{ fontSize: 13, color: T.gray500 }}>{p.nextPayout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ff-card">
        <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Transaksi terbaru</h3>
        {transactions.slice(0, 3).map((t, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? T.border : "none" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{t.campaign}</div>
              <div style={{ fontSize: 12, color: T.gray500 }}>{t.date} · {t.type}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.type === "Return" ? T.green : T.gray900 }}>
                {t.type === "Return" ? "+" : "−"}{fmt(t.amount)}
              </div>
              <span className="ff-badge ff-badge-green" style={{ fontSize: 11 }}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PortfolioTab() {
  const totalInvested = portfolio.reduce((a, b) => a + b.invested, 0);
  const totalReturn   = portfolio.reduce((a, b) => a + b.returnVal, 0);
  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: "1.5rem" }}>Portfolio saya</h2>
      <div className="ff-grid-2" style={{ marginBottom: "1.5rem" }}>
        <StatCard label="Total investasi"       value={fmt(totalInvested)} />
        <StatCard label="Total return diterima" value={fmt(totalReturn)} accent />
      </div>
      <div className="ff-card" style={{ overflowX: "auto" }}>
        <table className="ff-table">
          <thead>
            <tr>
              <th>Campaign</th><th>Modal</th><th>Return/th</th><th>Return diterima</th><th>Status</th><th>Payout berikut</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((p) => (
              <tr key={p.campaign}>
                <td style={{ fontWeight: 500 }}>{p.campaign}</td>
                <td>{fmt(p.invested)}</td>
                <td><span style={{ color: T.green, fontWeight: 500 }}>{p.return}</span></td>
                <td style={{ color: T.green }}>{fmt(p.returnVal)}</td>
                <td><span className={`ff-badge ${p.status === "Aktif" ? "ff-badge-green" : "ff-badge-gray"}`}>{p.status}</span></td>
                <td style={{ fontSize: 13, color: T.gray500 }}>{p.nextPayout}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ExploreTab() {
  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Jelajahi Campaign</h2>
      <p style={{ fontSize: 14, color: T.gray500, marginBottom: "1.5rem" }}>Semua UMKM telah diverifikasi tim FolkFund.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: "1rem" }}>
        {campaigns.map((c) => <CampaignCard key={c.id} c={c} onClick={() => {}} />)}
      </div>
    </>
  );
}

function TransaksiTab() {
  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: "1.5rem" }}>Riwayat transaksi</h2>
      <div className="ff-card" style={{ overflowX: "auto" }}>
        <table className="ff-table">
          <thead>
            <tr><th>Tanggal</th><th>Jenis</th><th>Campaign</th><th>Jumlah</th><th>Status</th></tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i}>
                <td style={{ fontSize: 13, color: T.gray500 }}>{t.date}</td>
                <td><span className={`ff-badge ${t.type === "Return" ? "ff-badge-green" : "ff-badge-blue"}`}>{t.type}</span></td>
                <td style={{ fontWeight: 500 }}>{t.campaign}</td>
                <td style={{ fontWeight: 600, color: t.type === "Return" ? T.green : T.gray900 }}>
                  {t.type === "Return" ? "+" : "−"}{fmt(t.amount)}
                </td>
                <td><span className="ff-badge ff-badge-green">{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function InvestorDashboard() {
  const [tab, setTab] = useState("overview");

  const saldoFooter = (
    <div style={{ padding: 12, background: T.greenLight, borderRadius: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.green, marginBottom: 4 }}>Saldo tersedia</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: T.greenDark }}>Rp 3.250.000</div>
      <button className="ff-btn ff-btn-sm" style={{ marginTop: 8, width: "100%", fontSize: 12 }}>Top Up</button>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      {/* Sidebar Area Container */}
      <div className="ff-sidebar-wrapper" style={{ width: 240, borderRight: T.border, padding: "1.5rem 1rem", background: T.white, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: T.green, marginBottom: "0.5rem" }}>BA</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Budi Ardianto</div>
          <div style={{ fontSize: 12, color: T.gray500 }}>Investor Reguler</div>
        </div>
        <Sidebar links={SIDEBAR_LINKS} activeTab={tab} setTab={setTab} footer={saldoFooter} />
      </div>

      {/* Main content */}
      <main style={{ flex: 1, padding: "2rem", background: T.gray50, overflow: "auto" }}>
        {tab === "overview"  && <Overview setTab={setTab} />}
        {tab === "portfolio" && <PortfolioTab />}
        {tab === "explore"   && <ExploreTab />}
        {tab === "txn"       && <TransaksiTab />}
      </main>
    </div>
  );
}