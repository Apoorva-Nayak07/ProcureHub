import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBoxOpen, faCircleCheck, faTrophy, faLock, faChevronRight, faClipboardList, faXmark } from "@fortawesome/free-solid-svg-icons";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { getMyPOs, closePO } from "../services/api";

const DUMMY = [
  { id: 1, item_description: "Hot-rolled Steel Rods, Grade A, 12mm diameter", quantity: 1000, target_delivery_date: "2026-07-15", status: "open_for_bids" },
  { id: 2, item_description: "Copper Wire Coils, 2.5mm, 99.9% purity",        quantity: 500,  target_delivery_date: "2026-07-20", status: "awarded" },
  { id: 3, item_description: "Aluminium Sheets 4x8 ft, 3mm thickness",        quantity: 200,  target_delivery_date: "2026-08-01", status: "open_for_bids" },
  { id: 4, item_description: "Industrial Grade PVC Pipes, 50mm dia, 6m length",quantity: 750, target_delivery_date: "2026-07-30", status: "closed" },
  { id: 5, item_description: "Stainless Steel Bolts M12x50, Grade 8.8",       quantity: 5000, target_delivery_date: "2026-08-10", status: "open_for_bids" },
];

function AnimatedNumber({ value }) {
  return <span style={{ animation: "countUp 0.5s cubic-bezier(0.4,0,0.2,1)" }}>{value}</span>;
}

export default function Dashboard() {
  const [pos, setPos]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [closing, setClosing] = useState(null);
  const navigate = useNavigate();
  const company = localStorage.getItem("company_name") || "Your Company";

  useEffect(() => {
    getMyPOs().then((r) => setPos(r.data)).catch(() => setPos(DUMMY)).finally(() => setLoading(false));
  }, []);

  const handleClosePO = async (poId) => {
    if (!window.confirm("Close this PO? All pending bids will be rejected.")) return;
    setClosing(poId);
    try {
      await closePO(poId);
      setPos(prev => prev.map(p => p.id === poId ? { ...p, status: "closed" } : p));
    } catch {
      alert("Failed to close PO. Please try again.");
    } finally {
      setClosing(null);
    }
  };

  const stats = {
    total:   pos.length,
    open:    pos.filter((p) => p.status === "open_for_bids").length,
    awarded: pos.filter((p) => p.status === "awarded").length,
    closed:  pos.filter((p) => p.status === "closed").length,
  };

  const filtered = filter === "all" ? pos : pos.filter((p) => p.status === filter);

  const statCards = [
    { label: "Total POs",     value: stats.total,   icon: faBoxOpen,     color: "var(--moss)",       bg: "var(--dew)" },
    { label: "Open for Bids", value: stats.open,    icon: faCircleCheck, color: "var(--success)",    bg: "var(--success-bg)" },
    { label: "Awarded",       value: stats.awarded, icon: faTrophy,      color: "var(--info)",       bg: "var(--info-bg)" },
    { label: "Closed",        value: stats.closed,  icon: faLock,        color: "var(--text-muted)", bg: "var(--bg-alt)" },
  ];

  return (
    <Layout>
      {/* Page header */}
      <div style={s.pageHeader}>
        <div>
          <p style={s.greeting}>Good day, {company} 👋</p>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.sub}>Track your purchase orders and incoming bids</p>
        </div>
        <button style={s.createBtn} onClick={() => navigate("/create-po")}>
          <FontAwesomeIcon icon={faPlus} />
          New Purchase Order
        </button>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {statCards.map((c, i) => (
          <div key={c.label} style={{ ...s.statCard, animationDelay: `${i * 60}ms`, borderTop: `3px solid ${c.color}` }}>
            <div style={s.statTop}>
              <span style={s.statLabel}>{c.label.toUpperCase()}</span>
              <div style={{ ...s.statIconBox, background: c.bg }}>
                <FontAwesomeIcon icon={c.icon} style={{ fontSize: 15, color: c.color }} />
              </div>
            </div>
            <div style={{ ...s.statNum, color: c.color }}>
              <AnimatedNumber value={c.value} />
            </div>
            <div style={s.statFooter}>
              <span style={s.statFooterText}>
                {c.label === "Total POs"     && "All purchase orders"}
                {c.label === "Open for Bids" && "Awaiting vendor bids"}
                {c.label === "Awarded"       && "Contracts awarded"}
                {c.label === "Closed"        && "Completed orders"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={s.tableCard}>
        <div style={s.tableHeader}>
          <h2 style={s.tableTitle}>Purchase Orders</h2>
          <div style={s.filters}>
            {[
              { key: "all",          label: "All" },
              { key: "open_for_bids",label: "Open" },
              { key: "awarded",      label: "Awarded" },
              { key: "closed",       label: "Closed" },
            ].map((f) => (
              <button key={f.key} style={{ ...s.filterBtn, ...(filter === f.key ? s.filterActive : {}) }}
                onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={s.loadingWrap}>
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 52, margin: "1px 0" }}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: 40, color: "var(--text-muted)" }} />
            <span>No purchase orders yet.</span>
            <button style={s.createBtn} onClick={() => navigate("/create-po")}>
              <FontAwesomeIcon icon={faPlus} /> Create Purchase Order
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["PO ID", "Item Description", "Quantity", "Target Delivery", "Status", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((po, i) => (
                  <tr key={po.id} className="trow" style={{ ...s.tr, animationDelay: `${i * 40}ms`, animation: "fadeIn 0.3s ease both" }}>
                    <td style={s.td}><span style={s.poId}>#{po.id}</span></td>
                    <td style={{ ...s.td, maxWidth: 260 }}>
                      <span style={s.itemDesc}>{po.item_description}</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.qty}>{po.quantity.toLocaleString()}</span>
                      <span style={s.qtyUnit}> units</span>
                    </td>
                    <td style={s.td}>{new Date(po.target_delivery_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td style={s.td}><StatusBadge status={po.status}/></td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <button style={s.viewBtn} onClick={() => navigate(`/po/${po.id}/bids`)}>
                          View Bids
                          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11 }} />
                        </button>
                        {po.status !== "closed" && (
                          <button
                            style={{ ...s.closeBtn, opacity: closing === po.id ? 0.6 : 1 }}
                            onClick={() => handleClosePO(po.id)}
                            disabled={closing === po.id}
                            title="Close this PO"
                          >
                            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />
                            {closing === po.id ? "Closing…" : "Close"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

const s = {
  pageHeader:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  greeting:    { fontSize: 13, color: "var(--text-muted)", marginBottom: 2 },
  title:       { fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" },
  sub:         { color: "var(--text-muted)", fontSize: 13, marginTop: 3 },
  createBtn:   { display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#6B7F5E,#516349)", color: "#fff", border: "none", padding: "11px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, boxShadow: "0 4px 14px rgba(107,127,94,0.35)", transition: "all 0.2s" },
  statsGrid:   { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 },
  statCard:    { background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: 6, animation: "fadeIn 0.4s ease both" },
  statTop:     { display: "flex", justifyContent: "space-between", alignItems: "center" },
  statIconBox: { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statNum:     { fontSize: 28, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" },
  statLabel:   { fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 },
  statFooter:  { marginTop: 4 },
  statFooterText: { fontSize: 11, color: "var(--text-muted)" },
  tableCard:   { background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", overflow: "hidden", animation: "fadeIn 0.4s ease both" },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid var(--border-light)" },
  tableTitle:  { fontSize: 15, fontWeight: 700, color: "var(--text)" },
  filters:     { display: "flex", gap: 6 },
  filterBtn:   { padding: "5px 13px", borderRadius: 20, border: "1.5px solid var(--border)", background: "transparent", fontSize: 12, fontWeight: 500, color: "var(--text-muted)", cursor: "pointer", transition: "all 0.18s" },
  filterActive:{ background: "var(--dew)", border: "1.5px solid var(--moss)", color: "var(--primary-dark)", fontWeight: 600 },
  table:       { width: "100%", borderCollapse: "collapse" },
  th:          { background: "var(--bg-alt)", padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" },
  tr:          { borderBottom: "1px solid var(--border-light)", transition: "background 0.15s" },
  td:          { padding: "14px 18px", fontSize: 13.5, color: "var(--text)", verticalAlign: "middle" },
  poId:        { fontFamily: "monospace", background: "var(--dew)", color: "var(--primary-dark)", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600 },
  itemDesc:    { display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", fontWeight: 500 },
  qty:         { fontWeight: 700 },
  qtyUnit:     { color: "var(--text-muted)", fontSize: 12 },
  viewBtn:     { display: "inline-flex", alignItems: "center", gap: 5, background: "var(--dew)", color: "var(--primary-dark)", border: "none", padding: "6px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, transition: "all 0.18s", cursor: "pointer" },
  closeBtn:    { display: "inline-flex", alignItems: "center", gap: 5, background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger)", padding: "6px 11px", borderRadius: 8, fontSize: 12, fontWeight: 600, transition: "all 0.18s", cursor: "pointer" },
  loadingWrap: { padding: "8px 16px", display: "flex", flexDirection: "column", gap: 6 },
  empty:       { padding: "56px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" },
};
