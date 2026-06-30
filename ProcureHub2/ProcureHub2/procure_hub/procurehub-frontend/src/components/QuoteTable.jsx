function QuoteTable({ quotes, onAccept }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          {["Vendor", "Price", "Lead Time", "Rating", "Action"].map((h) => (
            <th key={h} style={styles.th}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {quotes.map((q) => (
          <tr key={q.id} style={styles.tr}>
            <td style={styles.td}>{q.vendor}</td>
            <td style={styles.td}>₹{q.price.toLocaleString()}</td>
            <td style={styles.td}>{q.leadTime} Days</td>
            <td style={styles.td}>⭐ {q.rating}</td>
            <td style={styles.td}>
              <button style={styles.btn} onClick={() => onAccept(q.id)}>Accept</button>
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
  btn:   { background: "linear-gradient(135deg,#6B7F5E,#516349)", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600 },
};

export default QuoteTable;
