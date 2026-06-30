import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell, faCircleCheck, faCircleXmark, faBullhorn,
  faBoxOpen, faCheckDouble, faInbox,
} from "@fortawesome/free-solid-svg-icons";
import { getNotifications, markNotifRead, markAllRead } from "../services/api";

const DUMMY = [
  { id: 1, type: "bid_received", message: "New bid of ₹87,500 received on PO-0001: Hot-rolled Steel Rods, Grade A.", is_read: false, created_at: new Date(Date.now() - 3600000).toISOString(), po_id: 1 },
  { id: 2, type: "bid_awarded",  message: "Congratulations! Your bid of ₹45,000 was awarded for PO-0003: Aluminium Sheets 4x8 ft.", is_read: false, created_at: new Date(Date.now() - 7200000).toISOString(), po_id: 3 },
  { id: 3, type: "bid_rejected", message: "Your bid for PO-0002: Copper Wire Coils was not selected.", is_read: true,  created_at: new Date(Date.now() - 86400000).toISOString(), po_id: 2 },
  { id: 4, type: "bid_received", message: "New bid of ₹91,000 received on PO-0001: Hot-rolled Steel Rods, Grade A.", is_read: true,  created_at: new Date(Date.now() - 172800000).toISOString(), po_id: 1 },
  { id: 5, type: "po_closed",    message: "PO-0004 has been closed by the manager. Your bid was not selected.", is_read: true, created_at: new Date(Date.now() - 259200000).toISOString(), po_id: 4 },
];

const typeConfig = {
  bid_received: { icon: faBell,        color: "var(--teal,#4E7A8A)",    bg: "var(--info-bg)",     label: "Bid Received" },
  bid_awarded:  { icon: faCircleCheck, color: "var(--success)",         bg: "var(--success-bg)",  label: "Bid Awarded" },
  bid_rejected: { icon: faCircleXmark, color: "var(--danger)",          bg: "var(--danger-bg)",   label: "Bid Rejected" },
  po_closed:    { icon: faBoxOpen,     color: "var(--text-muted)",      bg: "var(--bg-alt)",      label: "PO Closed" },
  weekly_report:{ icon: faBullhorn,    color: "var(--warning)",         bg: "var(--warning-bg)",  label: "Weekly Report" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Notifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all"); // all | unread

  useEffect(() => {
    getNotifications()
      .then(r => setNotifs(Array.isArray(r.data) ? r.data : []))
      .catch(() => setNotifs(DUMMY))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotifRead(id);
    } catch { /* offline fallback */ }
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
    } catch { /* offline fallback */ }
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const displayed = filter === "unread" ? notifs.filter(n => !n.is_read) : notifs;
  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <Layout>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.title}>
            <FontAwesomeIcon icon={faBell} style={{ color: "var(--moss)", marginRight: 10 }} />
            Notifications
            {unreadCount > 0 && <span style={s.unreadBadge}>{unreadCount} new</span>}
          </h1>
          <p style={s.sub}>Stay updated on bids, awards, and procurement activity</p>
        </div>
        {unreadCount > 0 && (
          <button style={s.markAllBtn} onClick={handleMarkAll}>
            <FontAwesomeIcon icon={faCheckDouble} style={{ fontSize: 12 }} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={s.tabs}>
        {[
          { key: "all",    label: `All (${notifs.length})` },
          { key: "unread", label: `Unread (${unreadCount})` },
        ].map(t => (
          <button key={t.key}
            style={{ ...s.tab, ...(filter === t.key ? s.tabActive : {}) }}
            onClick={() => setFilter(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={s.list}>
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 12, marginBottom: 8 }} />)
        ) : displayed.length === 0 ? (
          <div style={s.empty}>
            <FontAwesomeIcon icon={faInbox} style={{ fontSize: 40, color: "var(--text-muted)" }} />
            <p style={{ fontWeight: 600, color: "var(--text)" }}>
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Activity from bids and awards will appear here</p>
          </div>
        ) : (
          displayed.map((n, i) => {
            const cfg = typeConfig[n.type] || typeConfig.bid_received;
            return (
              <div key={n.id}
                style={{ ...s.item, ...(n.is_read ? {} : s.itemUnread), animationDelay: `${i * 40}ms` }}
                onClick={() => !n.is_read && handleMarkRead(n.id)}>
                <div style={{ ...s.iconBox, background: cfg.bg }}>
                  <FontAwesomeIcon icon={cfg.icon} style={{ fontSize: 15, color: cfg.color }} />
                </div>
                <div style={s.content}>
                  <div style={s.topRow}>
                    <span style={{ ...s.typeBadge, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    <span style={s.time}>{timeAgo(n.created_at)}</span>
                  </div>
                  <p style={{ ...s.message, fontWeight: n.is_read ? 400 : 600 }}>{n.message}</p>
                </div>
                {!n.is_read && <span style={s.dot} />}
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}

const s = {
  pageHeader:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 },
  title:       { fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 10 },
  unreadBadge: { background: "var(--danger)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, marginLeft: 4 },
  sub:         { color: "var(--text-muted)", fontSize: 13, marginTop: 3 },
  markAllBtn:  { display: "flex", alignItems: "center", gap: 7, background: "var(--dew)", color: "var(--primary-dark)", border: "1.5px solid var(--moss)", padding: "8px 16px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: "pointer" },
  tabs:        { display: "flex", gap: 8, marginBottom: 20 },
  tab:         { padding: "7px 18px", borderRadius: 20, border: "1.5px solid var(--border)", background: "transparent", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", cursor: "pointer" },
  tabActive:   { background: "var(--dew)", border: "1.5px solid var(--moss)", color: "var(--primary-dark)", fontWeight: 700 },
  list:        { display: "flex", flexDirection: "column", gap: 8 },
  item:        { display: "flex", alignItems: "flex-start", gap: 14, background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)", cursor: "pointer", transition: "all 0.18s", animation: "fadeIn 0.3s ease both", position: "relative" },
  itemUnread:  { borderLeft: "3px solid var(--moss)", background: "var(--dew)" },
  iconBox:     { width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  content:     { flex: 1 },
  topRow:      { display: "flex", alignItems: "center", gap: 10, marginBottom: 5 },
  typeBadge:   { fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20 },
  time:        { fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" },
  message:     { fontSize: 13.5, color: "var(--text)", lineHeight: 1.5, margin: 0 },
  dot:         { width: 9, height: 9, borderRadius: "50%", background: "var(--moss)", flexShrink: 0, marginTop: 6 },
  empty:       { padding: "60px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", background: "#fff", borderRadius: 16, border: "1px solid var(--border-light)" },
};
