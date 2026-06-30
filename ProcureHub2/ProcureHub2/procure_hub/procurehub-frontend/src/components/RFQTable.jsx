import { useNavigate } from "react-router-dom";

function RFQTable({ rfqs }) {
  const navigate = useNavigate();

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          {["RFQ ID", "Material", "Quantity", "Status", "Action"].map((h) => (
            <th key={h} style={styles.th}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rfqs.map((rfq) => (
          <tr key={rfq.id} style={styles.tr}>
            <td style={styles.td}>{rfq.id}</td>
            <td style={styles.td}>{rfq.material}</td>
            <td style={styles.td}>{rfq.quantity}</td>
            <td style={styles.td}>
              <span style={{ ...styles.badge, background: rfq.status === "OPEN" ? "var(--success-bg)" : "var(--danger-bg)", color: rfq.status === "OPEN" ? "var(--success)" : "var(--danger)" }}>
                {rfq.status}
              </span>
            </td>
            <td style={styles.td}>
              <button style={styles.btn} onClick={() => navigate(`/rfq/${rfq.id}`)}>
                View Quotes
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles = {
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border-light)" },
  th:    { background: "var(--sidebar-bg)", color: "#fff", padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" },
  tr:    { borderBottom: "1px solid var(--border-light)" },
  td:    { padding: "12px 16px", color: "var(--text)", fontSize: 13.5 },
  badge: { padding: "3px 10px", borderRadius: 12, fontSize: "0.8rem", fontWeight: 600 },
  btn:   { background: "var(--sidebar-bg)", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600 },
};

export default RFQTable;
