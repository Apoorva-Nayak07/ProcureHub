import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInbox, faBolt, faTrophy } from "@fortawesome/free-solid-svg-icons";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { getViewBids, awardBid } from "../services/api";

export default function ViewBids() {
  const { poId } = useParams();
  const navigate  = useNavigate();
  const [bids, setBids]     = useState([]);
  const [po, setPo]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy]   = useState("bid_amount");
  const [awarding, setAwarding] = useState(null);

  useEffect(() => {
    getViewBids(poId)
      .then((r) => {
        const data = r.data;
        if (data.po) setPo(data.po);
        setBids(Array.isArray(data.bids) ? data.bids : Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setPo({ item_description: "Hot-rolled Steel Rods, Grade A, 12mm diameter", quantity: 1000 });
        setBids([
          { id: 1, company_name: "ABC Metals Pvt. Ltd.",   bid_amount: "87500.00", promised_delivery_days: 7,  status: "submitted" },
          { id: 2, company_name: "Global Steel Suppliers", bid_amount: "91000.00", promised_delivery_days: 5,  status: "accepted" },
          { id: 3, company_name: "IndoMetal Corp.",        bid_amount: "84000.00", promised_delivery_days: 10, status: "rejected" },
          { id: 4, company_name: "Prime Alloys Ltd.",      bid_amount: "89500.00", promised_delivery_days: 6,  status: "submitted" },
        ]);
      })
      .finally(() => setLoading(false));
  }, [poId]);

  const handleAward = async (bidId) => {
    setAwarding(bidId);
    try {
      await awardBid(bidId);
      setBids((prev) =>
        prev.map((b) => ({ ...b, status: b.id === bidId ? "accepted" : b.status === "submitted" ? "rejected" : b.status }))
      );
    } catch {
      alert("Failed to award bid. Please try again.");
    } finally {
      setAwarding(null);
    }
  };

  const sorted = [...bids].sort((a, b) =>
    sortBy === "bid_amount"
      ? parseFloat(a.bid_amount) - parseFloat(b.bid_amount)
      : a.promised_delivery_days - b.promised_delivery_days
  );

  const lowestBid = sorted.length ? parseFloat(sorted[0].bid_amount) : null;

  return (
    <Layout>
      <div style={s.pageHeader}>
        <button style={s.back} onClick={() => navigate("/dashboard")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Dashboard
        </button>
        <div style={s.titleRow}>
          <div>
            <h1 style={s.title}>
              Bids for <span style={s.poTag}>PO-{String(poId).padStart(4,"0")}</span>
            </h1>
            {po && <p style={s.sub}>{po.item_description} · {po.quantity?.toLocaleString()} units</p>}
          </div>
          <div style={s.bidCount}>
            <span style={s.bidCountNum}>{bids.length}</span>
            <span style={s.bidCountLabel}>bid{bids.length !== 1 ? "s" : ""} received</span>
          </div>
        </div>
      </div>

      {bids.length > 0 && (
        <div style={s.controls}>
          <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 600 }}>Sort by:</span>
          {[
            { key: "bid_amount",            label: "Lowest Price" },
            { key: "promised_delivery_days",label: "Fastest Delivery" },
          ].map((opt) => (
            <button key={opt.key}
              style={{ ...s.sortBtn, ...(sortBy === opt.key ? s.sortActive : {}) }}
              onClick={() => setSortBy(opt.key)}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div style={s.tableCard}>
        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 56 }}/>)}
          </div>
        ) : sorted.length === 0 ? (
          <div style={s.empty}>
            <FontAwesomeIcon icon={faInbox} style={{ fontSize: 40, color: "var(--text-muted)" }} />
            <p style={{ fontWeight: 600, color: "var(--text)" }}>No bids yet</p>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Vendors haven&apos;t submitted bids for this PO yet.</p>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["Rank", "Vendor", "Bid Amount", "Delivery", "Status", ""].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((bid, i) => {
                const isLowest = parseFloat(bid.bid_amount) === lowestBid;
                return (
                  <tr key={bid.id} className="trow" style={{ ...s.tr, animation: `fadeIn 0.3s ease ${i * 50}ms both` }}>
                    <td style={s.td}>
                      {i === 0
                        ? <span style={s.rank1}><FontAwesomeIcon icon={faTrophy} style={{ color: "#A8934A", marginRight: 4 }} />#1</span>
                        : <span style={s.rankN}>#{i + 1}</span>}
                    </td>
                    <td style={s.td}>
                      <div style={s.vendorCell}>
                        <div style={s.vendorAvatar}>{bid.company_name?.slice(0,1)}</div>
                        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{bid.company_name || `Vendor #${bid.vendor_id}`}</span>
                      </div>
                    </td>
                    <td style={s.td}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>₹{parseFloat(bid.bid_amount).toLocaleString()}</span>
                        {isLowest && <span style={s.lowestTag}>Lowest</span>}
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={s.deliveryChip}>
                        <FontAwesomeIcon icon={faBolt} style={{ fontSize: 10 }} /> {bid.promised_delivery_days} days
                      </span>
                    </td>
                    <td style={s.td}><StatusBadge status={bid.status}/></td>
                    <td style={s.td}>
                      {bid.status === "submitted" && (
                        <button style={s.awardBtn} onClick={() => handleAward(bid.id)} disabled={awarding === bid.id}>
                          {awarding === bid.id ? "Awarding…" : "Award Bid"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

const s = {
  pageHeader:    { marginBottom: 24 },
  back:          { display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 12, padding: 0 },
  titleRow:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  title:         { fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 8 },
  poTag:         { fontFamily: "monospace", background: "var(--dew)", color: "var(--primary-dark)", padding: "2px 10px", borderRadius: 8, fontSize: 18 },
  sub:           { color: "var(--text-muted)", fontSize: 13, marginTop: 5 },
  bidCount:      { display: "flex", flexDirection: "column", alignItems: "center", background: "var(--dew)", borderRadius: 12, padding: "10px 20px" },
  bidCountNum:   { fontSize: 28, fontWeight: 800, color: "var(--primary-dark)", lineHeight: 1 },
  bidCountLabel: { fontSize: 11, color: "var(--moss)", fontWeight: 600, marginTop: 2 },
  controls:      { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 },
  sortBtn:       { padding: "6px 14px", borderRadius: 20, border: "1.5px solid var(--border)", background: "transparent", fontSize: 12, fontWeight: 500, color: "var(--text-muted)", cursor: "pointer", transition: "all 0.18s" },
  sortActive:    { background: "var(--dew)", border: "1.5px solid var(--moss)", color: "var(--primary-dark)", fontWeight: 700 },
  tableCard:     { background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", overflow: "hidden", animation: "fadeIn 0.35s ease" },
  table:         { width: "100%", borderCollapse: "collapse" },
  th:            { background: "var(--bg-alt)", padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" },
  tr:            { borderBottom: "1px solid var(--border-light)" },
  td:            { padding: "15px 18px", fontSize: 13.5, verticalAlign: "middle" },
  rank1:         { background: "var(--warning-bg)", color: "var(--warning)", padding: "3px 10px", borderRadius: 7, fontSize: 12, fontWeight: 700 },
  rankN:         { color: "var(--text-muted)", fontSize: 13, fontWeight: 600 },
  vendorCell:    { display: "flex", alignItems: "center", gap: 10 },
  vendorAvatar:  { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,var(--sage),var(--moss))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 },
  lowestTag:     { marginLeft: 8, background: "var(--success-bg)", color: "var(--success)", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6 },
  deliveryChip:  { background: "var(--bg-alt)", color: "var(--text-muted)", padding: "4px 10px", borderRadius: 8, fontSize: 12.5, fontWeight: 600 },
  awardBtn:      { background: "linear-gradient(135deg,#5A8A4A,#3D6A35)", color: "#fff", border: "none", padding: "6px 16px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, boxShadow: "0 2px 8px rgba(90,138,74,0.35)", cursor: "pointer" },
  empty:         { padding: "56px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" },
};
