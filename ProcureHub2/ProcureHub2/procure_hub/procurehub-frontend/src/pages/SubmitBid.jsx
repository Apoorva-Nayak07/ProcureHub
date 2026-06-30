import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faBolt, faScaleBalanced, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import Layout from "../components/Layout";
import { submitBid } from "../services/api";

export default function SubmitBid() {
  const { poId } = useParams();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ bid_amount: "", promised_delivery_days: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await submitBid({
        po_id: parseInt(poId, 10),
        bid_amount: parseFloat(form.bid_amount),
        promised_delivery_days: parseInt(form.promised_delivery_days, 10),
      });
      setSuccess(true);
    } catch {
      setError("Failed to submit bid. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div style={s.successWrap}>
          <div style={s.successCard}>
            <div style={s.checkCircle}>
              <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 40, color: "var(--success)" }} />
            </div>
            <h2 style={s.successTitle}>Bid Submitted!</h2>
            <p style={s.successMsg}>Your bid for <strong>PO-{String(poId).padStart(4,"0")}</strong> has been submitted. The manager will review all bids and notify you.</p>
            <div style={s.successMeta}>
              <div style={s.successMetaItem}><span>Amount</span><strong>₹{parseFloat(form.bid_amount).toLocaleString()}</strong></div>
              <div style={s.successMetaItem}><span>Delivery</span><strong>{form.promised_delivery_days} days</strong></div>
            </div>
            <button style={s.backBtn} onClick={() => navigate("/marketplace")}>
              ← Back to Marketplace
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={s.pageHeader}>
        <button style={s.back} onClick={() => navigate("/marketplace")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Marketplace
        </button>
        <h1 style={s.title}>Submit Your Bid</h1>
        <p style={s.sub}>Purchase Order <span style={s.poTag}>PO-{String(poId).padStart(4,"0")}</span></p>
      </div>

      <div style={s.layout}>
        <div style={s.formCard}>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Your Bid Amount <span style={s.required}>*</span></label>
              <div style={s.inputWrap}>
                <span style={s.currencySymbol}>₹</span>
                <input className="input-base" style={{ paddingLeft: 36 }} type="number"
                  name="bid_amount" value={form.bid_amount} onChange={handle}
                  placeholder="0.00" step="0.01" min="0" required />
              </div>
              <span style={s.hint}>Enter your total price for the complete quantity requested.</span>
            </div>

            <div style={s.field}>
              <label style={s.label}>Promised Delivery (Days) <span style={s.required}>*</span></label>
              <div style={s.inputWrap}>
                <svg style={s.inputIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <input className="input-base" style={{ paddingLeft: 36 }} type="number"
                  name="promised_delivery_days" value={form.promised_delivery_days} onChange={handle}
                  placeholder="e.g. 7" min="1" required />
              </div>
              <span style={s.hint}>From order confirmation to delivery at the buyer&apos;s location.</span>
            </div>

            {error && (
              <div style={s.errorBox}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div style={s.actions}>
              <button type="button" style={s.cancelBtn} onClick={() => navigate("/marketplace")}>Cancel</button>
              <button type="submit" style={s.submitBtn} disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }}/> Submitting...</>
                  : "Submit Bid →"
                }
              </button>
            </div>
          </form>
        </div>

        <div style={s.tipsSidebar}>
          <div style={s.tipsCard}>
            <h3 style={s.tipsTitle}>Bidding Tips</h3>
            {[
              { icon: faScaleBalanced, text: "Price competitively — managers compare all bids side by side." },
              { icon: faBolt,          text: "Faster delivery often wins even if price is slightly higher." },
              { icon: faBoxOpen,       text: "Make sure you can fulfill the full quantity before bidding." },
            ].map((t) => (
              <div key={t.text} style={s.tip}>
                <FontAwesomeIcon icon={t.icon} style={{ fontSize: 16, color: "var(--moss)", flexShrink: 0, marginTop: 2 }} />
                <p style={s.tipText}>{t.text}</p>
              </div>
            ))}
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
  sub:         { color: "var(--text-muted)", fontSize: 13, marginTop: 4, display: "flex", alignItems: "center", gap: 6 },
  poTag:       { fontFamily: "monospace", background: "var(--dew)", color: "var(--primary-dark)", padding: "2px 9px", borderRadius: 7, fontSize: 12, fontWeight: 700 },
  layout:      { display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" },
  formCard:    { background: "#fff", borderRadius: 16, padding: 28, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", animation: "fadeIn 0.3s ease" },
  form:        { display: "flex", flexDirection: "column", gap: 20 },
  field:       { display: "flex", flexDirection: "column", gap: 7 },
  label:       { fontSize: 12.5, fontWeight: 700, color: "var(--text)" },
  required:    { color: "var(--danger)", marginLeft: 2 },
  inputWrap:   { position: "relative", display: "flex", alignItems: "center" },
  currencySymbol: { position: "absolute", left: 13, fontWeight: 700, color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" },
  inputIcon:   { position: "absolute", left: 12, color: "var(--text-muted)", pointerEvents: "none" },
  hint:        { fontSize: 11.5, color: "var(--text-muted)" },
  errorBox:    { display: "flex", alignItems: "center", gap: 8, background: "var(--danger-bg)", color: "var(--danger)", padding: "11px 14px", borderRadius: 10, fontSize: 13 },
  actions:     { display: "flex", gap: 10, justifyContent: "flex-end" },
  cancelBtn:   { padding: "10px 20px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", color: "var(--text-muted)", fontSize: 13.5, fontWeight: 500, cursor: "pointer" },
  submitBtn:   { display: "flex", alignItems: "center", gap: 7, padding: "10px 22px", background: "linear-gradient(135deg,#6B7F5E,#516349)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700, boxShadow: "0 4px 14px rgba(107,127,94,0.35)", cursor: "pointer" },
  tipsSidebar: { display: "flex", flexDirection: "column", gap: 14 },
  tipsCard:    { background: "#fff", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", animation: "fadeIn 0.4s ease" },
  tipsTitle:   { fontSize: 13, fontWeight: 700, marginBottom: 14, color: "var(--text)" },
  tip:         { display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" },
  tipText:     { fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 },
  // Success
  successWrap:     { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" },
  successCard:     { background: "#fff", borderRadius: 20, padding: "44px 40px", textAlign: "center", maxWidth: 440, width: "100%", boxShadow: "var(--shadow-md)", animation: "scaleIn 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  checkCircle:     { width: 72, height: 72, borderRadius: "50%", background: "var(--success-bg)", display: "flex", alignItems: "center", justifyContent: "center" },
  successTitle:    { fontSize: 22, fontWeight: 800, color: "var(--text)" },
  successMsg:      { color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.6 },
  successMeta:     { display: "flex", gap: 24, background: "var(--bg-alt)", borderRadius: 12, padding: "12px 24px", width: "100%" },
  successMetaItem: { flex: 1, display: "flex", flexDirection: "column", gap: 2, alignItems: "center" },
  backBtn:         { padding: "11px 24px", background: "linear-gradient(135deg,#6B7F5E,#516349)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, boxShadow: "0 4px 14px rgba(107,127,94,0.35)", cursor: "pointer" },
};
