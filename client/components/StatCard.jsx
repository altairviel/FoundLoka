import { T } from "../styles/tokens";

export default function StatCard({ label, value, accent = false, delta }) {
  return (
    <div className="ff-card">
      <div className="ff-stat-label">{label}</div>
      <div
        className="ff-stat-num"
        style={{ color: accent ? T.green : T.gray900 }}
      >
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 12, color: T.green, marginTop: 4 }}>{delta}</div>
      )}
    </div>
  );
}