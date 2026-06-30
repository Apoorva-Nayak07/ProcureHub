import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import QuoteTable from "../components/QuoteTable";
import { getQuotes } from "../services/api";

// Dummy quotes for development
const DUMMY_QUOTES = [
  { id: "Q1", vendor: "ABC Suppliers", price: 90000, leadTime: 5, rating: 4.8 },
  { id: "Q2", vendor: "XYZ Metals", price: 92000, leadTime: 3, rating: 4.5 },
  { id: "Q3", vendor: "Global Steel Co.", price: 88500, leadTime: 7, rating: 4.2 },
];

function RFQDetails() {
  const { id } = useParams();
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    getQuotes(id)
      .then((res) => setQuotes(res.data))
      .catch(() => setQuotes(DUMMY_QUOTES));
  }, [id]);

  const handleAccept = (quoteId) => {
    alert(`Quote ${quoteId} accepted! (Backend integration pending)`);
  };

  return (
    <div>
      <Navbar />
      <div style={styles.layout}>
        <Sidebar role="PROCUREMENT_MANAGER" />
        <main style={styles.main}>
          <h2 style={styles.heading}>Quotes for {id}</h2>
          <QuoteTable quotes={quotes} onAccept={handleAccept} />
        </main>
      </div>
    </div>
  );
}

const styles = {
  layout:  { display: "flex" },
  main:    { flex: 1, padding: "24px", background: "var(--bg)", minHeight: "calc(100vh - 48px)" },
  heading: { marginBottom: "16px", color: "var(--text)", fontWeight: 800, fontSize: 22 },
};

export default RFQDetails;
