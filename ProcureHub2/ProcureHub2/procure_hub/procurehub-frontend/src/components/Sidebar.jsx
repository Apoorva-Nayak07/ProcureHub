import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableCells, faPlus, faStore, faFileLines, faBoxOpen,
  faChartLine, faBell,
} from "@fortawesome/free-solid-svg-icons";

const managerLinks = [
  { to: "/dashboard",   label: "Dashboard",          icon: faTableCells },
  { to: "/create-po",   label: "New Purchase Order",  icon: faPlus },
  { to: "/analytics",   label: "Analytics",           icon: faChartLine },
  { to: "/notifications", label: "Notifications",     icon: faBell },
];

const vendorLinks = [
  { to: "/marketplace",   label: "Marketplace",   icon: faStore },
  { to: "/my-bids",       label: "My Bids",       icon: faFileLines },
  { to: "/analytics",     label: "Analytics",     icon: faChartLine },
  { to: "/notifications", label: "Notifications", icon: faBell },
];

export default function Sidebar({ role }) {
  const links = role === "vendor" ? vendorLinks : managerLinks;

  return (
    <aside style={s.aside}>
      <div style={s.section}>
        <span style={s.sectionLabel}>{role === "vendor" ? "VENDOR" : "MANAGER"}</span>
        <nav style={s.nav}>
          {links.map((l, i) => (
            <NavLink
              key={l.to}
              to={l.to}
              style={({ isActive }) => ({
                ...s.link,
                animationDelay: `${i * 60}ms`,
                ...(isActive ? s.active : {}),
              })}
            >
              <span style={s.iconWrap}>
                <FontAwesomeIcon icon={l.icon} style={{ fontSize: 14 }} />
              </span>
              <span style={s.label}>{l.label}</span>
              {l.to === "/marketplace" && <span style={s.badge}>Live</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div style={s.footer}>
        <div style={s.footerCard}>
          <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: 18, color: "var(--sage)" }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--sage)" }}>ProcureHub</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>v1.0.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

const s = {
  aside:        { width: 230, minHeight: "calc(100vh - 60px)", background: "var(--sidebar-bg)", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px 0 16px" },
  section:      { padding: "0 12px" },
  sectionLabel: { display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", padding: "0 10px", marginBottom: 8 },
  nav:          { display: "flex", flexDirection: "column", gap: 3 },
  link:         { display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 10, color: "rgba(255,255,255,0.55)", fontSize: 13.5, fontWeight: 500, textDecoration: "none", transition: "all 0.18s ease", animation: "fadeInLeft 0.3s ease both", position: "relative" },
  active:       { background: "rgba(107,127,94,0.30)", color: "#fff", boxShadow: "inset 3px 0 0 var(--sage)" },
  iconWrap:     { width: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  label:        { flex: 1 },
  badge:        { fontSize: 9, fontWeight: 700, background: "var(--success)", color: "#fff", padding: "2px 7px", borderRadius: 20, letterSpacing: "0.04em" },
  footer:       { padding: "0 12px" },
  footerCard:   { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.05)" },
};
