import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faChevronDown, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { getUnreadCount } from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const company = localStorage.getItem("company_name") || "My Company";
  const role = localStorage.getItem("role");
  const isManager = role === "procurement_manager";
  const [dropOpen, setDropOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const initials = company.slice(0, 2).toUpperCase();

  useEffect(() => {
    const fetchUnread = () => {
      getUnreadCount()
        .then(r => setUnread(r.data?.unread ?? 0))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={s.header}>
      <div style={s.left}>
        <div style={s.logoBadge}>
          <span style={s.logoP}>P</span>
        </div>
        <div style={s.logoGroup}>
          <span style={s.logoText}>Procure<span style={s.logoAccent}>Hub</span></span>
        </div>
        <span style={s.portalTag}>{isManager ? "Manager Portal" : "Vendor Portal"}</span>
      </div>

      <div style={s.right}>
        <div style={s.iconBtn} onClick={() => navigate("/notifications")} title="Notifications">
          <FontAwesomeIcon icon={faBell} style={{ fontSize: 15, color: "var(--text-muted)" }} />
          {unread > 0 && (
            <span style={s.notifDot}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button style={s.avatarBtn} onClick={() => setDropOpen(!dropOpen)}>
            <div style={s.avatarCircle}>{initials}</div>
            <div style={s.avatarInfo}>
              <span style={s.avatarName}>{company}</span>
              <span style={s.avatarRole}>{isManager ? "Procurement Manager" : "Vendor"}</span>
            </div>
            <FontAwesomeIcon
              icon={faChevronDown}
              style={{ fontSize: 11, color: "var(--text-muted)", transition: "transform 0.2s", transform: dropOpen ? "rotate(180deg)" : "rotate(0)" }}
            />
          </button>

          {dropOpen && (
            <div style={s.dropdown}>
              <div style={s.dropHeader}>
                <div style={{ ...s.avatarCircle, width: 38, height: 38, fontSize: 14 }}>{initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{company}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 1 }}>
                    {isManager ? "Procurement Manager" : "Vendor"}
                  </div>
                </div>
              </div>
              <div style={s.dropDivider} />
              <button style={s.dropItem} onClick={() => { localStorage.clear(); navigate("/login"); }}>
                <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 13 }} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const s = {
  header:      { height: 60, background: "#fff", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 200, boxShadow: "0 2px 12px rgba(74,61,48,0.06)" },
  left:        { display: "flex", alignItems: "center", gap: 12 },
  logoBadge:   { width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#6B7F5E,#516349)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoP:       { color: "#fff", fontWeight: 900, fontSize: 17, letterSpacing: "-0.03em", fontFamily: "'Inter', sans-serif" },
  logoGroup:   { display: "flex", alignItems: "baseline", gap: 0 },
  logoText:    { fontWeight: 800, fontSize: 18, color: "var(--text)", letterSpacing: "-0.03em" },
  logoAccent:  { color: "var(--moss)" },
  portalTag:   { background: "var(--dew)", color: "#516349", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
  right:       { display: "flex", alignItems: "center", gap: 10 },
  iconBtn:     { position: "relative", width: 38, height: 38, borderRadius: 10, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-light)", cursor: "pointer" },
  notifDot:    { position: "absolute", top: 5, right: 5, minWidth: 16, height: 16, borderRadius: 10, background: "var(--danger)", border: "2px solid #fff", fontSize: 8, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" },
  avatarBtn:   { display: "flex", alignItems: "center", gap: 10, padding: "6px 12px 6px 6px", borderRadius: 10, border: "1px solid var(--border-light)", background: "var(--bg)", cursor: "pointer" },
  avatarCircle:{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,var(--sage),var(--moss))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11, flexShrink: 0 },
  avatarInfo:  { display: "flex", flexDirection: "column", gap: 0 },
  avatarName:  { fontWeight: 600, fontSize: 12, color: "var(--text)", lineHeight: 1.3 },
  avatarRole:  { fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3 },
  dropdown:    { position: "absolute", top: "calc(100% + 8px)", right: 0, width: 220, background: "#fff", borderRadius: 12, border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)", overflow: "hidden", zIndex: 300, animation: "slideDown 0.2s ease" },
  dropHeader:  { display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 12px" },
  dropDivider: { height: 1, background: "var(--border-light)" },
  dropItem:    { display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "11px 14px", background: "none", border: "none", fontSize: 13, color: "var(--danger)", fontWeight: 500, cursor: "pointer" },
};
