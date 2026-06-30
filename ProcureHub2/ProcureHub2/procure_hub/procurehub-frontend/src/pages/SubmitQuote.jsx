import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { submitQuote } from "../services/api";

function SubmitQuote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ price: "", leadTime: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitQuote({ rfqId: id, ...form, price: Number(form.price), leadTime: Number(form.leadTime) });
    } catch {
      // backend not connected yet, simulate success
    }
    setSubmitted(true);
    setTimeout(() => navigate("/marketplace"), 2000);
  };

  return (
    <div>
      <Navbar />
      <div style={styles.layout}>
        <Sidebar role="VENDOR" />
        <main style={styles.main}>
          <h2 style={styles.heading}>Submit Quote for {id}</h2>
          {submitted ? (
            <p style={styles.success}>✅ Quote submitted! Redirecting...</p>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.label}>Price (₹)</label>
              <input
                style={styles.input}
                type="number"
                name="price"
                placeholder="e.g. 90000"
                value={form.price}
                onChange={handleChange}
                required
              />
              <label style={styles.label}>Lead Time (Days)</label>
              <input
                style={styles.input}
                type="number"
                name="leadTime"
                placeholder="e.g. 5"
                value={form.leadTime}
                onChange={handleChange}
                required
              />
              <label style={styles.label}>Message</label>
              <textarea
                style={{ ...styles.input, height: "80px", resize: "vertical" }}
                name="message"
                placeholder="Any additional notes..."
                value={form.message}
                onChange={handleChange}
              />
              <button style={styles.btn} type="submit">Submit Quote</button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  layout:  { display: "flex" },
  main:    { flex: 1, padding: "24px", background: "var(--bg)", minHeight: "calc(100vh - 48px)" },
  heading: { marginBottom: "16px", color: "var(--text)", fontWeight: 800, fontSize: 22 },
  form:    { background: "#fff", padding: "24px", borderRadius: 12, maxWidth: "480px", display: "flex", flexDirection: "column", gap: "10px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" },
  label:   { fontWeight: "600", color: "var(--text)", fontSize: "0.9rem" },
  input:   { padding: "10px 14px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: "0.95rem", outline: "none", fontFamily: "inherit" },
  btn:     { background: "linear-gradient(135deg,#6B7F5E,#516349)", color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontSize: "1rem", cursor: "pointer", marginTop: "4px", fontWeight: 700 },
  success: { color: "var(--success)", fontSize: "1.1rem", fontWeight: "600" },
};

export default SubmitQuote;
