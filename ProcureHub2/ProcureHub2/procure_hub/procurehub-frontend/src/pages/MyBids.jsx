import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines, faBolt } from "@fortawesome/free-solid-svg-icons";
import { getMyBids } from "../services/api";

export default function MyBids() {
  const [bids, setBids]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBids()
      .then((r) => setBids(Array.isArray(r.data) ? r.data : []))
      .catch(() => setBids([
        { id: 1, po_id: 1, bid_amount: "87500.00", promised_delivery_days: 7,  status: "submitted" },
        { id: 2, po_id: 3, bid_amount: "45000.00", promised_delivery_days: 5,  status: "accepted" },
        { id: 3, po_id: 6, bid_amount: "12800.00", promised_delivery_days: 10, status: "rejected" },
      ]))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total:     bids.length,
    accepted:  bids.filter((b) => b.status === "accepted").length,
    submitted: bids.filter((b) => b.status === "submitted").length,
    rejected:  bids.filter((b) => b.status === "rejected").length,
  };

  return (
    <Layout>
      <div style={s.pageHeader}>
        <h1 style={s.title}>My Bids</h1>
        <p style={s.sub}>Track the status of all your submitted bids</p>
      </div>

      <div style={s.statsRow}>
        {[
          { label: "Total Submitted", value: stats.total,     color: "var(--moss)",    bg: "var(--dew)" },
          { label: "Accepted",        value: stats.accepted,  color: "var(--success)", bg: "var(--success-bg)" },
          { label: "Pending Review",  value: stats.submitted, color: "var(--warning)", bg: "var(--warning-bg)" },
          { label: "Rejected",        value: stats.rejected,  color: "var(--danger)",  bg: "var(--danger-bg)" },
        ].map((c, i) => (
          <div key={c.label} style={{ ...s.statCard, animationDelay: `${i * 60}ms` }}>
            <div style={{ ...s.statDot, background: c.bg, color: c.color }}>
              <span style={{ fontSize: 22, fontWeight: 800 }}>{c.value}</span>
            </div>
            <span style={s.statLabel}>{c.label}</span>
          </div>
        ))}
      </div>

      <div style={s.tableCard}>
        <div style={s.tableHeader}>
          <h2 style={s.tableTitle}>Bid History</h2>
        </div>

        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 56 }}/>)}
          </div>
        ) : bids.length === 0 ? (
          <div style={s.empty}>
            <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 40, color: "var(--text-muted)" }} />
            <p style={{ fontWeight: 600, color: "var(--text)" }}>No bids submitted yet</p>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Browse the marketplace to find open tenders</p>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["Bid ID", "Purchase Order", "Your Bid Amount", "Delivery", "Status"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bids.map((bid, i) => (
                <tr key={bid.id} className="trow" style={{ ...s.tr, animation: `fadeIn 0.3s ease ${i * 50}ms both` }}>
                  <td style={s.td}>
                    <span style={s.bidIdChip}>#{bid.id}</span>
                  </td>
                  <td style={s.td}>
                    <span style={s.poChip}>PO-{String(bid.po_id).padStart(4,"0")}</span>
                  </td>
                  <td style={s.td}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                      ₹{parseFloat(bid.bid_amount).toLocaleString()}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={s.deliveryChip}>
                      <FontAwesomeIcon icon={faBolt} style={{ fontSize: 10 }} /> {bid.promised_delivery_days} days
                    </span>
                  </td>
                  <td style={s.td}><StatusBadge status={bid.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

const s = {
  pageHeader:   { marginBottom: 24 },
  title:        { fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" },
  sub:          { color: "var(--text-muted)", fontSize: 13, marginTop: 3 },
  statsRow:     { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 },
  statCard:     { background: "#fff", borderRadius: 14, padding: "16px 18px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 14, animation: "fadeIn 0.4s ease both" },
  statDot:      { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statLabel:    { fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 },
  tableCard:    { background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", overflow: "hidden", animation: "fadeIn 0.4s ease" },
  tableHeader:  { padding: "16px 20px", borderBottom: "1px solid var(--border-light)" },
  tableTitle:   { fontSize: 15, fontWeight: 700, color: "var(--text)" },
  table:        { width: "100%", borderCollapse: "collapse" },
  th:           { background: "var(--bg-alt)", padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid var(--border-light)" },
  tr:           { borderBottom: "1px solid var(--border-light)" },
  td:           { padding: "14px 18px", fontSize: 13.5, verticalAlign: "middle" },
  bidIdChip:    { fontFamily: "monospace", background: "var(--bg-alt)", color: "var(--text-muted)", padding: "2px 8px", borderRadius: 6, fontSize: 12 },
  poChip:       { fontFamily: "monospace", background: "var(--dew)", color: "var(--primary-dark)", padding: "3px 9px", borderRadius: 7, fontSize: 12, fontWeight: 700 },
  deliveryChip: { background: "var(--bg-alt)", color: "var(--text-muted)", padding: "4px 10px", borderRadius: 8, fontSize: 12.5, fontWeight: 600 },
  empty:        { padding: "56px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" },
};
