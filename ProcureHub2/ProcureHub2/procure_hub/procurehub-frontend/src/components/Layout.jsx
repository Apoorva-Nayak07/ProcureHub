import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const role = localStorage.getItem("role");
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar role={role} />
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", animation: "fadeIn 0.3s ease" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
