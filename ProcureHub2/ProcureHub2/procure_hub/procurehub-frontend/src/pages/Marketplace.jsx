import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faChevronRight, faBolt, faCalendarAlt, faCubes, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import Layout from "../components/Layout";
import { getMarketplace } from "../services/api";

const DUMMY = [
  { id: 1, item_description: "Hot-rolled Steel Rods, Grade A, 12mm diameter",         quantity: 1000, target_delivery_date: "2026-07-15", company_name: "Tata Steel Ltd." },
  { id: 3, item_description: "Aluminium Sheets 4x8 ft, 3mm thickness, IS 737 grade",  quantity: 200,  target_delivery_date: "2026-08-01", company_name: "Hindalco Industries" },
  { id: 5, item_description: "Stainless Steel Bolts M12x50, Grade 8.8, DIN 931",      quantity: 5000, target_delivery_date: "2026-08-10", company_name: "Bharat Forge Ltd." },
  { id: 6, item_description: "Industrial Rubber Gaskets, 100mm OD, NBR grade",         quantity: 300,  target_delivery_date: "2026-07-25", company_name: "Larsen & Toubro" },
  { id: 7, item_description: "MS Angle Iron 50x50x5mm, IS 2062 grade",                quantity: 2000, target_delivery_date: "2026-08-05", company_name: "SAIL Distributors" },
  { id: 8, item_description: "HDPE Pipes 110mm dia, PN 10 rating, IS 4984",           quantity: 400,  target_delivery_date: "2026-07-28", company_name: "Reliance Industries" },
];

function daysLeft(dateStr) {
  const diff = new Date(dateStr) - new Date();
  const d = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return d > 0 ? d : 0;
}

export default function Marketplace() {
  const [pos, setPos]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getMarketplace().then((r) => setPos(r.data)).catch(() => setPos(DUMMY)).finally(() => setLoading(false));
  }, []);

  const filtered = pos.filter((p) =>
    p.item_description.toLowerCase().includes(search.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Vendor Marketplace</h1>
          <p style={s.sub}>Browse open purchase orders and submit competitive bids</p>
        </div>
        <div style={s.liveChip}>
          <span style={s.liveDot} />
          {filtered.length} Live Tender{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div style={s.searchBar}>
        <FontAwesomeIcon icon={faSearch} style={s.searchIcon} />
        <input style={s.searchInput} type="text" placeholder="Search by material or company..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button style={s.clearBtn} onClick={() => setSearch("")}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {loading ? (
        <div style={s.skeletonGrid}>
          {[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton" style={{ height: 210, borderRadius: 16 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <FontAwesomeIcon icon={faSearch} style={{ fontSize: 40, color: "var(--text-muted)" }} />
          <p style={{ fontWeight: 600, fontSize: 16 }}>No tenders found</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Try a different search term</p>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map((po, i) => {
            const days   = daysLeft(po.target_delivery_date);
            const urgent = days <= 5;
            const deadlineStyle = urgent
              ? { background: "var(--danger-bg)", color: "var(--danger)" }
              : { background: "var(--bg-alt)", color: "var(--text-muted)" };

            return (
              <div key={po.id} style={{ ...s.card, animationDelay: `${i * 50}ms` }}>
                <div style={s.cardTop}>
                  <span style={s.poChip}>PO-{String(po.id).padStart(4, "0")}</span>
                  <span style={{ ...s.deadlineChip, ...deadlineStyle }}>
                    <FontAwesomeIcon icon={urgent ? faBolt : faCalendarAlt} style={{ fontSize: 10 }} />
                    {" "}{days}d left
                  </span>
                </div>

                <h3 style={s.itemDesc}>{po.item_description}</h3>

                <div style={s.companyRow}>
                  <div style={s.companyAvatar}>{po.company_name?.slice(0, 1)}</div>
                  <span style={s.companyName}>{po.company_name}</span>
                </div>

                <div style={s.metaRow}>
                  <div style={s.metaBox}>
                    <span style={s.metaLabel}><FontAwesomeIcon icon={faCubes} style={{ marginRight: 4 }} />Qty</span>
                    <span style={s.metaVal}>{po.quantity?.toLocaleString()}</span>
                  </div>
                  <div style={s.metaDiv} />
                  <div style={s.metaBox}>
                    <span style={s.metaLabel}><FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: 4 }} />Deliver by</span>
                    <span style={s.metaVal}>{new Date(po.target_delivery_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                  <div style={s.metaDiv} />
                  <div style={s.metaBox}>
                    <span style={s.metaLabel}><FontAwesomeIcon icon={faCircleCheck} style={{ marginRight: 4 }} />Status</span>
                    <span style={{ ...s.metaVal, color: "var(--success)" }}>Open</span>
                  </div>
                </div>

                <button style={s.bidBtn} onClick={() => navigate(`/submit-bid/${po.id}`)}>
                  Submit Bid
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

const s = {
  header:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title:        { fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" },
  sub:          { color: "var(--text-muted)", fontSize: 13, marginTop: 3 },
  liveChip:     { display: "flex", alignItems: "center", gap: 7, background: "var(--success-bg)", color: "var(--success)", padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 },
  liveDot:      { width: 8, height: 8, borderRadius: "50%", background: "var(--success)", animation: "pulse 1.5s infinite", flexShrink: 0 },
  searchBar:    { position: "relative", display: "flex", alignItems: "center", marginBottom: 24 },
  searchIcon:   { position: "absolute", left: 14, color: "var(--text-muted)", pointerEvents: "none", fontSize: 14 },
  searchInput:  { width: "100%", maxWidth: 460, padding: "11px 40px", border: "1.5px solid var(--border)", borderRadius: 12, fontSize: 14, outline: "none", background: "#fff", transition: "border 0.2s", fontFamily: "inherit" },
  clearBtn:     { position: "absolute", left: 430, background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", padding: 4 },
  skeletonGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 },
  grid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 },
  card:         { background: "#fff", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: 12, transition: "box-shadow 0.22s ease, transform 0.22s ease", animation: "fadeIn 0.35s ease both" },
  cardTop:      { display: "flex", justifyContent: "space-between", alignItems: "center" },
  poChip:       { fontFamily: "monospace", background: "var(--dew)", color: "var(--primary-dark)", padding: "3px 9px", borderRadius: 7, fontSize: 11.5, fontWeight: 700 },
  deadlineChip: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 7 },
  itemDesc:     { fontSize: 14, fontWeight: 700, color: "var(--text)", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  companyRow:   { display: "flex", alignItems: "center", gap: 8 },
  companyAvatar:{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,var(--sage),var(--moss))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0 },
  companyName:  { fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 },
  metaRow:      { display: "flex", background: "var(--bg-alt)", borderRadius: 10, padding: "10px 0", alignItems: "center" },
  metaBox:      { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  metaDiv:      { width: 1, height: 28, background: "var(--border-light)" },
  metaLabel:    { fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" },
  metaVal:      { fontSize: 13, fontWeight: 700, color: "var(--text)" },
  bidBtn:       { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", background: "linear-gradient(135deg,#6B7F5E,#516349)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700, boxShadow: "0 3px 10px rgba(107,127,94,0.30)", transition: "all 0.2s", marginTop: 2 },
  empty:        { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "80px 0", textAlign: "center" },
};
