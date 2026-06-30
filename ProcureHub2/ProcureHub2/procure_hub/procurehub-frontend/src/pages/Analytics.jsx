import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine, faCoins, faTrophy, faArrowTrendUp,
  faCalendarWeek, faLeaf,
} from "@fortawesome/free-solid-svg-icons";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import {
  getWeeklyReport, getTrends, getTopVendors, getSavings, getDashboardStats,
} from "../services/api";

// ── Nature-tone chart colours ────────────────────────────────
const C = {
  moss:    "#6B7F5E",
  fern:    "#8CA67A",
  sage:    "#B2C4A8",
  stone:   "#8C7B6E",
  amber:   "#A8934A",
  teal:    "#4E7A8A",
  danger:  "#A0514C",
  success: "#5A8A4A",
};

const DUMMY_WEEKLY_MGR = {
  role: "procurement_manager",
  labels: ["Mon 23 Jun","Tue 24 Jun","Wed 25 Jun","Thu 26 Jun","Fri 27 Jun","Sat 28 Jun","Sun 29 Jun"],
  pos_created:    [1, 0, 2, 1, 0, 0, 1],
  bids_received:  [3, 5, 8, 2, 7, 1, 4],
  summary: { pos_this_week: 5, bids_this_week: 30 },
};
const DUMMY_WEEKLY_VENDOR = {
  role: "vendor",
  labels: ["Mon 23 Jun","Tue 24 Jun","Wed 25 Jun","Thu 26 Jun","Fri 27 Jun","Sat 28 Jun","Sun 29 Jun"],
  bids_submitted: [1, 2, 0, 3, 1, 0, 2],
  bids_won:       [0, 1, 0, 1, 0, 0, 1],
  summary: { bids_this_week: 9, wins_this_week: 3 },
};
const DUMMY_TRENDS = {
  labels: ["Feb 2026","Mar 2026","Apr 2026","May 2026","Jun 2026","Jul 2026"],
  pos:  [4, 6, 5, 8, 7, 9],
  bids: [12, 18, 15, 24, 22, 28],
};
const DUMMY_TOP = [
  { company_name: "ABC Metals",   wins: 5, total_value: 425000 },
  { company_name: "Global Steel", wins: 4, total_value: 380000 },
  { company_name: "IndoMetal",    wins: 3, total_value: 260000 },
  { company_name: "Prime Alloys", wins: 2, total_value: 185000 },
  { company_name: "FastBuild Co", wins: 1, total_value: 92000  },
];
const DUMMY_SAVINGS = {
  total_saved: 47500,
  pos: [
    { po_id: 1, item_description: "Hot-rolled Steel Rods, Grade A", avg_bid: 91000, accepted_bid: 87500, saved: 3500, bid_count: 4 },
    { po_id: 2, item_description: "Copper Wire Coils, 2.5mm",       avg_bid: 47500, accepted_bid: 45000, saved: 2500, bid_count: 3 },
    { po_id: 3, item_description: "Aluminium Sheets 4x8 ft",        avg_bid: 33000, accepted_bid: 29500, saved: 3500, bid_count: 5 },
  ],
};

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ ...s.statCard, borderTop: `3px solid ${color}` }}>
      <div style={s.statRow}>
        <span style={s.statLabel}>{label.toUpperCase()}</span>
        <div style={{ ...s.statIcon, background: color + "22" }}>
          <FontAwesomeIcon icon={icon} style={{ color, fontSize: 15 }} />
        </div>
      </div>
      <div style={{ ...s.statVal, color }}>{value}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.tooltip}>
      <p style={s.tooltipLabel}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontSize: 12, margin: "2px 0" }}>
          {p.name}: <strong>{typeof p.value === "number" && p.value > 1000 ? `₹${p.value.toLocaleString()}` : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const role = localStorage.getItem("role");
  const isManager = role === "procurement_manager";

  const [weekly,  setWeekly]  = useState(null);
  const [trends,  setTrends]  = useState(null);
  const [top,     setTop]     = useState([]);
  const [savings, setSavings] = useState(null);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = [
      getWeeklyReport().then(r => setWeekly(r.data)).catch(() => setWeekly(isManager ? DUMMY_WEEKLY_MGR : DUMMY_WEEKLY_VENDOR)),
      getTrends().then(r => setTrends(r.data)).catch(() => setTrends(DUMMY_TRENDS)),
      getDashboardStats().then(r => setStats(r.data)).catch(() => setStats(null)),
    ];
    if (isManager) {
      p.push(getTopVendors().then(r => setTop(r.data)).catch(() => setTop(DUMMY_TOP)));
      p.push(getSavings().then(r => setSavings(r.data)).catch(() => setSavings(DUMMY_SAVINGS)));
    }
    Promise.all(p).finally(() => setLoading(false));
  }, [isManager]);

  const weeklyData = weekly
    ? weekly.labels.map((label, i) => ({
        label,
        ...(isManager
          ? { "POs Created": weekly.pos_created[i], "Bids Received": weekly.bids_received[i] }
          : { "Bids Submitted": weekly.bids_submitted[i], "Bids Won": weekly.bids_won[i] }),
      }))
    : [];

  const trendsData = trends
    ? trends.labels.map((label, i) => ({
        label,
        ...(isManager
          ? { "POs": trends.pos[i], "Bids": trends.bids[i] }
          : { "Submitted": trends.bids[i], "Won": trends.wins?.[i] ?? 0 }),
      }))
    : [];

  return (
    <Layout>
      {/* Header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.title}>
            <FontAwesomeIcon icon={faLeaf} style={{ color: "var(--moss)", marginRight: 10 }} />
            Analytics & Reports
          </h1>
          <p style={s.sub}>
            {isManager
              ? "Your procurement performance at a glance"
              : "Your bidding performance and win rates"}
          </p>
        </div>
        <div style={s.weekBadge}>
          <FontAwesomeIcon icon={faCalendarWeek} style={{ fontSize: 13 }} />
          Week of {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      {loading ? (
        <div style={s.skeletons}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div style={s.statsGrid}>
            {isManager ? (
              <>
                <StatCard icon={faChartLine}    label="Total POs"        value={stats?.total_pos ?? "—"}   sub="All time"               color={C.moss} />
                <StatCard icon={faArrowTrendUp} label="Bids This Week"   value={weekly?.summary?.bids_this_week ?? 0} sub="Last 7 days" color={C.teal} />
                <StatCard icon={faTrophy}       label="Awarded POs"      value={stats?.awarded_pos ?? "—"} sub="Contracts placed"        color={C.success} />
                <StatCard icon={faCoins}        label="Total Spend"      value={stats?.total_spend ? `₹${Number(stats.total_spend).toLocaleString()}` : "₹0"} sub="Across awarded bids" color={C.amber} />
              </>
            ) : (
              <>
                <StatCard icon={faChartLine}    label="Total Bids"       value={stats?.total_bids ?? "—"}  sub="All time"               color={C.moss} />
                <StatCard icon={faTrophy}       label="Win Rate"         value={`${stats?.win_rate_pct ?? 0}%`} sub="Accepted bids"     color={C.success} />
                <StatCard icon={faArrowTrendUp} label="Bids This Week"   value={weekly?.summary?.bids_this_week ?? 0} sub="Last 7 days" color={C.teal} />
                <StatCard icon={faCoins}        label="Total Revenue"    value={stats?.total_revenue ? `₹${Number(stats.total_revenue).toLocaleString()}` : "₹0"} sub="From won bids" color={C.amber} />
              </>
            )}
          </div>

          {/* ── Weekly Activity (Bar Chart) ── */}
          <div style={s.chartCard}>
            <h2 style={s.chartTitle}>Weekly Activity — Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={v => v.split(" ").slice(0,2).join(" ")} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {isManager ? (
                  <>
                    <Bar dataKey="POs Created"   fill={C.moss}  radius={[4,4,0,0]} />
                    <Bar dataKey="Bids Received" fill={C.fern}  radius={[4,4,0,0]} />
                  </>
                ) : (
                  <>
                    <Bar dataKey="Bids Submitted" fill={C.moss}    radius={[4,4,0,0]} />
                    <Bar dataKey="Bids Won"        fill={C.success} radius={[4,4,0,0]} />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── 6-Month Trends (Area Chart) ── */}
          <div style={s.chartCard}>
            <h2 style={s.chartTitle}>6-Month Trend</h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gMoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.moss}    stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.moss}    stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.teal}    stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.teal}    stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {isManager ? (
                  <>
                    <Area type="monotone" dataKey="POs"  stroke={C.moss} fill="url(#gMoss)" strokeWidth={2} dot={{ r: 4 }} />
                    <Area type="monotone" dataKey="Bids" stroke={C.teal} fill="url(#gTeal)" strokeWidth={2} dot={{ r: 4 }} />
                  </>
                ) : (
                  <>
                    <Area type="monotone" dataKey="Submitted" stroke={C.moss}    fill="url(#gMoss)" strokeWidth={2} dot={{ r: 4 }} />
                    <Area type="monotone" dataKey="Won"        stroke={C.success} fill="url(#gTeal)" strokeWidth={2} dot={{ r: 4 }} />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── Manager only: Top Vendors + Cost Savings ── */}
          {isManager && (
            <div style={s.bottomGrid}>
              {/* Top vendors */}
              <div style={s.chartCard}>
                <h2 style={s.chartTitle}>Top Vendors by Awards</h2>
                {top.length === 0 ? (
                  <p style={s.empty}>No awarded bids yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={top} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                      <YAxis type="category" dataKey="company_name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} width={110} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="wins" name="Wins" fill={C.moss} radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Cost savings */}
              <div style={s.chartCard}>
                <h2 style={s.chartTitle}>
                  Cost Savings
                  {savings?.total_saved > 0 && (
                    <span style={s.savingsBadge}>
                      ₹{Number(savings.total_saved).toLocaleString()} saved total
                    </span>
                  )}
                </h2>
                {!savings?.pos?.length ? (
                  <p style={s.empty}>Savings data appears after bids are awarded.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          {["PO", "Item", "Avg Bid", "Awarded", "Saved", "#Bids"].map(h => (
                            <th key={h} style={s.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {savings.pos.map((row, i) => (
                          <tr key={row.po_id} className="trow" style={{ ...s.tr, animationDelay: `${i * 40}ms` }}>
                            <td style={s.td}><span style={s.poChip}>#{row.po_id}</span></td>
                            <td style={{ ...s.td, maxWidth: 180 }}><span style={s.truncate}>{row.item_description}</span></td>
                            <td style={s.td}>₹{Number(row.avg_bid).toLocaleString()}</td>
                            <td style={s.td}>₹{Number(row.accepted_bid).toLocaleString()}</td>
                            <td style={s.td}><span style={s.savedChip}>₹{Number(row.saved).toLocaleString()}</span></td>
                            <td style={s.td}>{row.bid_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

const s = {
  pageHeader:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  title:        { fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" },
  sub:          { color: "var(--text-muted)", fontSize: 13, marginTop: 3 },
  weekBadge:    { display: "flex", alignItems: "center", gap: 7, background: "var(--dew)", color: "var(--primary-dark)", padding: "8px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  skeletons:    { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 },
  statsGrid:    { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 22 },
  statCard:     { background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: 6, animation: "fadeIn 0.4s ease both" },
  statRow:      { display: "flex", justifyContent: "space-between", alignItems: "center" },
  statLabel:    { fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em" },
  statIcon:     { width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" },
  statVal:      { fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 },
  statSub:      { fontSize: 11, color: "var(--text-muted)" },
  chartCard:    { background: "#fff", borderRadius: 16, padding: "22px 24px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", marginBottom: 20, animation: "fadeIn 0.4s ease both" },
  chartTitle:   { fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 },
  bottomGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  tooltip:      { background: "#fff", border: "1px solid var(--border-light)", borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow)" },
  tooltipLabel: { fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 4 },
  savingsBadge: { marginLeft: 10, background: "var(--success-bg)", color: "var(--success)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 },
  table:        { width: "100%", borderCollapse: "collapse" },
  th:           { background: "var(--bg-alt)", padding: "9px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" },
  tr:           { borderBottom: "1px solid var(--border-light)", animation: "fadeIn 0.3s ease both" },
  td:           { padding: "12px 14px", fontSize: 13, verticalAlign: "middle", color: "var(--text)" },
  poChip:       { fontFamily: "monospace", background: "var(--dew)", color: "var(--primary-dark)", padding: "2px 7px", borderRadius: 6, fontSize: 11, fontWeight: 700 },
  truncate:     { display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" },
  savedChip:    { background: "var(--success-bg)", color: "var(--success)", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 6 },
  empty:        { color: "var(--text-muted)", fontSize: 13, padding: "24px 0", textAlign: "center" },
};
