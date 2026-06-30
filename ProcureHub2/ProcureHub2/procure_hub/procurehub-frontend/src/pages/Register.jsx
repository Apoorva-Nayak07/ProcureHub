import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faEnvelope, faLock, faEye, faEyeSlash, faIndustry, faClipboardList, faCheck } from "@fortawesome/free-solid-svg-icons";
import { registerUser } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ email: "", password: "", company_name: "", role: "vendor" });
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed. Is the backend running?";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { val: "vendor",              icon: faIndustry,     title: "Vendor",  desc: "Submit bids on open tenders" },
    { val: "procurement_manager", icon: faClipboardList, title: "Manager", desc: "Post POs and evaluate bids" },
  ];

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} />
      <div style={s.card}>
        <div style={s.brand}>
          <div style={s.logoBadge}><span style={s.logoP}>P</span></div>
          <span style={s.logoText}>Procure<span style={s.logoAccent}>Hub</span></span>
        </div>

        <h1 style={s.title}>Create account</h1>
        <p style={s.sub}>Join the procurement network today</p>

        <div style={s.roleGrid}>
          {roles.map((r) => (
            <div key={r.val}
              style={{ ...s.roleCard, ...(form.role === r.val ? s.roleCardActive : {}) }}
              onClick={() => setForm({ ...form, role: r.val })}>
              <FontAwesomeIcon icon={r.icon} style={{ fontSize: 22, color: form.role === r.val ? "var(--moss)" : "var(--text-muted)" }} />
              <span style={s.roleTitle}>{r.title}</span>
              <span style={s.roleDesc}>{r.desc}</span>
              {form.role === r.val && (
                <div style={s.roleCheck}>
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: 9 }} />
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Company Name</label>
            <div style={s.inputWrap}>
              <FontAwesomeIcon icon={faBuilding} style={s.inputIcon} />
              <input className="input-base" style={s.input} type="text" name="company_name"
                value={form.company_name} onChange={handle} placeholder="Acme Industries Ltd." required />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Work Email</label>
            <div style={s.inputWrap}>
              <FontAwesomeIcon icon={faEnvelope} style={s.inputIcon} />
              <input className="input-base" style={s.input} type="email" name="email"
                value={form.email} onChange={handle} placeholder="you@company.com" required />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={s.inputWrap}>
              <FontAwesomeIcon icon={faLock} style={s.inputIcon} />
              <input className="input-base" style={s.input} type={showPass ? "text" : "password"}
                name="password" value={form.password} onChange={handle} placeholder="Min. 8 characters" required />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>
                <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} style={{ color: "var(--text-muted)", fontSize: 14 }} />
              </button>
            </div>
          </div>

          <button style={s.submitBtn} type="submit" disabled={loading}>
            {loading
              ? <><span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> Creating account...</>
              : "Create Account →"}
          </button>

          {error && <div style={s.errorBox}>{error}</div>}
        </form>

        <p style={s.footer}>
          Already have an account? <Link to="/login" style={s.footerLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:          { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg,#2E3528 0%,#1C2118 50%,#252C1E 100%)", position: "relative", overflow: "hidden", padding: "24px" },
  blob1:         { position: "absolute", top: "-10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(107,127,94,0.28),transparent 70%)", pointerEvents: "none" },
  blob2:         { position: "absolute", bottom: "-10%", left: "-5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(178,196,168,0.18),transparent 70%)", pointerEvents: "none" },
  card:          { position: "relative", background: "#fff", borderRadius: 20, padding: "40px 36px", width: 460, boxShadow: "0 24px 80px rgba(0,0,0,0.35)", animation: "scaleIn 0.35s cubic-bezier(0.4,0,0.2,1)" },
  brand:         { display: "flex", alignItems: "center", gap: 10, marginBottom: 24 },
  logoBadge:     { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6B7F5E,#516349)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoP:         { color: "#fff", fontWeight: 900, fontSize: 18, letterSpacing: "-0.03em" },
  logoText:      { fontWeight: 800, fontSize: 22, color: "var(--text)", letterSpacing: "-0.03em" },
  logoAccent:    { color: "var(--moss)" },
  title:         { fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 },
  sub:           { color: "var(--text-muted)", fontSize: 13.5, marginBottom: 20 },
  roleGrid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 },
  roleCard:      { position: "relative", padding: "14px 12px", borderRadius: 12, border: "2px solid var(--border)", cursor: "pointer", display: "flex", flexDirection: "column", gap: 3, transition: "all 0.2s", background: "#fff" },
  roleCardActive:{ border: "2px solid var(--moss)", background: "var(--dew)" },
  roleTitle:     { fontSize: 13, fontWeight: 700, color: "var(--text)" },
  roleDesc:      { fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 },
  roleCheck:     { position: "absolute", top: 8, right: 10, width: 18, height: 18, borderRadius: "50%", background: "var(--moss)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
  form:          { display: "flex", flexDirection: "column", gap: 14 },
  field:         { display: "flex", flexDirection: "column", gap: 6 },
  label:         { fontSize: 12.5, fontWeight: 600, color: "var(--text)" },
  inputWrap:     { position: "relative", display: "flex", alignItems: "center" },
  inputIcon:     { position: "absolute", left: 13, color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" },
  input:         { paddingLeft: 38, paddingRight: 38 },
  eyeBtn:        { position: "absolute", right: 12, background: "none", border: "none", padding: 2, display: "flex", alignItems: "center", cursor: "pointer" },
  submitBtn:     { marginTop: 6, padding: "13px", background: "linear-gradient(135deg,#6B7F5E,#516349)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(107,127,94,0.40)", cursor: "pointer" },
  errorBox:      { background: "var(--danger-bg)", color: "var(--danger)", padding: "10px 14px", borderRadius: 8, fontSize: 13, textAlign: "center" },
  footer:        { textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--text-muted)" },
  footerLink:    { color: "var(--moss)", fontWeight: 600 },
};
