import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faListUl, faHashtag, faCalendarAlt, faCircleCheck, faLightbulb, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import Layout from "../components/Layout";
import { createPO } from "../services/api";

export default function CreatePO() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ item_description: "", quantity: "", target_delivery_date: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await createPO({ ...form, quantity: parseInt(form.quantity, 10) });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1800);
    } catch {
      setError("Failed to create purchase order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div style={s.successPage}>
          <div style={s.successCard}>
            <div style={s.successRing}>
              <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 40, color: "var(--success)" }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Purchase Order Published!</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Your tender is now live. Vendors can start submitting bids.</p>
            <div className="spinner" style={{ marginTop: 8 }} />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={s.pageHeader}>
        <button style={s.back} onClick={() => navigate("/dashboard")}>
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 12 }} />
          Back to Dashboard
        </button>
        <h1 style={s.title}>New Purchase Order</h1>
        <p style={s.sub}>Create an open tender for vendors to submit competitive bids</p>
      </div>

      <div style={s.layout}>
        <div style={s.formCard}>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>
                <FontAwesomeIcon icon={faListUl} style={{ marginRight: 6, color: "var(--moss)" }} />
                Item / Material Description <span style={s.required}>*</span>
              </label>
              <textarea className="input-base" style={s.textarea}
                name="item_description" value={form.item_description} onChange={handle}
                placeholder="e.g. Hot-rolled steel rods, Grade A, 12mm diameter, IS 2062 standard, with mill test certificate"
                rows={3} required />
              <span style={s.hint}>Be specific — vendors will bid based on this description. Include grade, specifications, and standards.</span>
            </div>

            <div style={s.row}>
              <div style={{ ...s.field, flex: 1 }}>
                <label style={s.label}>
                  <FontAwesomeIcon icon={faHashtag} style={{ marginRight: 6, color: "var(--moss)" }} />
                  Quantity Required <span style={s.required}>*</span>
                </label>
                <input className="input-base" type="number" name="quantity"
                  value={form.quantity} onChange={handle} placeholder="e.g. 1000" min="1" required />
              </div>
              <div style={{ ...s.field, flex: 1 }}>
                <label style={s.label}>
                  <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: 6, color: "var(--moss)" }} />
                  Target Delivery Date <span style={s.required}>*</span>
                </label>
                <input className="input-base" type="date" name="target_delivery_date"
                  value={form.target_delivery_date} onChange={handle} required />
              </div>
            </div>

            {error && (
              <div style={s.errorBox}>
                <FontAwesomeIcon icon={faCircleInfo} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <div style={s.actions}>
              <button type="button" style={s.cancelBtn} onClick={() => navigate("/dashboard")}>Cancel</button>
              <button type="submit" style={s.submitBtn} disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> Publishing...</>
                  : <>Publish Tender <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} /></>
                }
              </button>
            </div>
          </form>
        </div>

        <div style={s.infoSidebar}>
          <div style={s.infoCard}>
            <h3 style={s.infoTitle}>How it works</h3>
            {[
              "You publish a Purchase Order with item details",
              "Vendors in the marketplace see your open tender",
              "Vendors submit competitive bids with price & delivery",
              "You compare bids and award the best one",
            ].map((text, i) => (
              <div key={i} style={s.step}>
                <div style={s.stepNum}>{i + 1}</div>
                <p style={s.stepText}>{text}</p>
              </div>
            ))}
          </div>
          <div style={s.tipCard}>
            <FontAwesomeIcon icon={faLightbulb} style={{ color: "var(--warning)", fontSize: 18, flexShrink: 0, marginTop: 2 }} />
            <p style={s.tipText}>Detailed descriptions attract more accurate bids and reduce back-and-forth with vendors.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const s = {
  pageHeader:  { marginBottom: 24 },
  back:        { display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 12, padding: 0 },
  title:       { fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" },
  sub:         { color: "var(--text-muted)", fontSize: 13, marginTop: 4 },
  layout:      { display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" },
  formCard:    { background: "#fff", borderRadius: 16, padding: 28, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", animation: "fadeIn 0.3s ease" },
  form:        { display: "flex", flexDirection: "column", gap: 20 },
  field:       { display: "flex", flexDirection: "column", gap: 7 },
  row:         { display: "flex", gap: 16 },
  label:       { fontSize: 12.5, fontWeight: 700, color: "var(--text)" },
  required:    { color: "var(--danger)", marginLeft: 2 },
  textarea:    { resize: "vertical", minHeight: 80, lineHeight: 1.6 },
  hint:        { fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 },
  errorBox:    { display: "flex", alignItems: "center", gap: 8, background: "var(--danger-bg)", color: "var(--danger)", padding: "11px 14px", borderRadius: 10, fontSize: 13 },
  actions:     { display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 },
  cancelBtn:   { padding: "10px 20px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", color: "var(--text-muted)", fontSize: 13.5, fontWeight: 500, cursor: "pointer" },
  submitBtn:   { display: "flex", alignItems: "center", gap: 7, padding: "10px 22px", background: "linear-gradient(135deg,#6B7F5E,#516349)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700, boxShadow: "0 4px 14px rgba(107,127,94,0.35)", cursor: "pointer" },
  infoSidebar: { display: "flex", flexDirection: "column", gap: 14 },
  infoCard:    { background: "#fff", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", animation: "fadeIn 0.4s ease" },
  infoTitle:   { fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 16 },
  step:        { display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" },
  stepNum:     { width: 24, height: 24, borderRadius: "50%", background: "var(--dew)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  stepText:    { fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 3 },
  tipCard:     { background: "var(--bg-alt)", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-start", border: "1px solid var(--border-light)" },
  tipText:     { fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 },
  successPage: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" },
  successCard: { background: "#fff", borderRadius: 20, padding: "48px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, boxShadow: "var(--shadow-md)", animation: "scaleIn 0.3s ease" },
  successRing: { width: 72, height: 72, borderRadius: "50%", background: "var(--success-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 },
};
