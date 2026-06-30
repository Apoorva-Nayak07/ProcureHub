const config = {
  open_for_bids: { bg: "var(--success-bg)", color: "var(--success)",    dot: "#5A8A4A", label: "Open for Bids" },
  awarded:       { bg: "var(--info-bg)",    color: "var(--info)",       dot: "#4E7A8A", label: "Awarded" },
  closed:        { bg: "var(--bg-alt)",     color: "var(--text-muted)", dot: "#B2C4A8", label: "Closed" },
  submitted:     { bg: "var(--warning-bg)", color: "var(--warning)",    dot: "#A8934A", label: "Submitted" },
  accepted:      { bg: "var(--success-bg)", color: "var(--success)",    dot: "#5A8A4A", label: "Accepted" },
  rejected:      { bg: "var(--danger-bg)",  color: "var(--danger)",     dot: "#A0514C", label: "Rejected" },
};

export default function StatusBadge({ status }) {
  const c = config[status] || { bg: "var(--bg-alt)", color: "var(--text-muted)", dot: "#B2C4A8", label: status };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.bg, color: c.color, padding: "4px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }}/>
      {c.label}
    </span>
  );
}
