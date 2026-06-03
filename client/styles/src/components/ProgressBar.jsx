import { T } from "../styles/tokens";

export default function ProgressBar({ value, height = 6, showLabel = false, label }) {
  const capped = Math.min(value, 100);
  return (
    <div>
      {showLabel && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
          <span>{label}</span>
          <span style={{ fontWeight: 500 }}>{capped}%</span>
        </div>
      )}
      <div className="ff-progress" style={{ height }}>
        <div className="ff-progress-fill" style={{ width: `${capped}%` }} />
      </div>
    </div>
  );
}