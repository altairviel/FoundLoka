import { T } from '../styles/tokens';
import StatCard from '../styles/src/components/StatCard';
import ProgressBar from '../styles/src/components/ProgressBar';
import { monthlyStats, sectorData, regionalData } from '../styles/dummyData';
import { fmt } from '../utils/format';

export default function Analytics() {
  const maxInvested = Math.max(...monthlyStats.map((m) => m.invested));

  return (
    <div style={{ background: T.gray50, minHeight: 'calc(100vh - 56px)', padding: '2rem 0' }}>
      <div className="ff-container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>Analitik Platform</h1>
          <p style={{ color: T.gray500, fontSize: 14, marginTop: 4 }}>Data per 29 Mei 2026</p>
        </div>

        {/* KPI row */}
        <div className="ff-grid-4" style={{ marginBottom: '2rem' }}>
          <StatCard label="Total Dana Disalurkan" value="Rp 12,4M" delta="+18% vs bulan lalu" />
          <StatCard label="Rata-rata Return" value="14,2%" delta="+0,4pp" />
          <StatCard label="Investor Aktif" value="1.847" delta="+123 bulan ini" />
          <StatCard label="UMKM Terdanai" value="312" delta="+28 bulan ini" />
        </div>

        <div className="ff-grid-2" style={{ marginBottom: '2rem' }}>
          {/* Bar chart */}
          <div className="ff-card">
            <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Dana disalurkan (6 bulan)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
              {monthlyStats.map((m) => {
                const h = Math.round((m.invested / maxInvested) * 140);
                const rh = Math.round((m.return / maxInvested) * 140);
                return (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 140 }}>
                      <div style={{ width: 14, height: h, background: T.green, borderRadius: '3px 3px 0 0' }} title={fmt(m.invested)} />
                      <div style={{ width: 10, height: rh, background: T.greenLight, border: `1px solid ${T.green}`, borderRadius: '3px 3px 0 0' }} title={fmt(m.return)} />
                    </div>
                    <span style={{ fontSize: 11, color: T.gray500 }}>{m.month}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: '1rem' }}>
              {[
                { color: T.green, border: 'none', label: 'Diinvestasikan' },
                { color: T.greenLight, border: `1px solid ${T.green}`, label: 'Return dibayar' },
              ].map(({ color, border, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.gray500 }}>
                  <div style={{ width: 10, height: 10, background: color, border, borderRadius: 2 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Sector breakdown */}
          <div className="ff-card">
            <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Sebaran sektor</h3>
            {sectorData.map((s) => (
              <div key={s.name} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{s.name}</span>
                  <span style={{ fontSize: 12, color: T.gray500 }}>
                    {s.pct}% · {s.count} UMKM
                  </span>
                </div>
                <ProgressBar value={s.pct} />
              </div>
            ))}
          </div>
        </div>

        {/* Regional table */}
        <div className="ff-card">
          <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Sebaran regional</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="ff-table">
              <thead>
                <tr>
                  <th>Provinsi</th>
                  <th>UMKM Terdanai</th>
                  <th>Dana Disalurkan</th>
                  <th>Rata-rata Return</th>
                  <th>Tingkat Keberhasilan</th>
                </tr>
              </thead>
              <tbody>
                {regionalData.map(([prov, count, dana, ret, scc]) => (
                  <tr key={prov}>
                    <td style={{ fontWeight: 500 }}>{prov}</td>
                    <td>{count}</td>
                    <td>{dana}</td>
                    <td style={{ color: T.green, fontWeight: 500 }}>{ret}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: T.gray200, borderRadius: 2 }}>
                          <div style={{ width: scc, height: 4, background: T.green, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 13, minWidth: 30 }}>{scc}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
