import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ── Auth ──────────────────────────────────────────────────────────────────
export const loginUser    = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);

// ── Procurement Manager (legacy routes) ──────────────────────────────────
export const createPO    = (data)  => API.post("/manager/create-po", data);
export const getMyPOs    = ()      => API.get("/manager/purchase-orders");
export const getViewBids = (poId)  => API.get(`/manager/bids/${poId}`);
export const awardBid    = (bidId) => API.put(`/manager/award/${bidId}`);

// ── Vendor (legacy routes) ────────────────────────────────────────────────
export const getMarketplace = () => API.get("/vendor/marketplace");
export const submitBid      = (data) => API.post("/vendor/submit-bid", data);
export const getMyBids      = () => API.get("/vendor/my-bids");

// ── v1 REST API – POST /api/v1/procurement/po  (Manager) ──────────────────
export const v1CreatePO = (data) => API.post("/v1/procurement/po", data);

// ── v1 REST API – GET  /api/v1/vendor/marketplace  (Vendor) ───────────────
export const v1GetMarketplace = () => API.get("/v1/vendor/marketplace");

// ── v1 REST API – POST /api/v1/vendor/bids/submit  (Vendor) ──────────────
export const v1SubmitBid = (data) => API.post("/v1/vendor/bids/submit", data);

// ── Analytics ─────────────────────────────────────────────────────────────
export const getDashboardStats = () => API.get("/analytics/dashboard");
export const getWeeklyReport   = () => API.get("/analytics/weekly");
export const getTrends         = () => API.get("/analytics/trends");
export const getTopVendors     = () => API.get("/analytics/top-vendors");
export const getSavings        = () => API.get("/analytics/savings");

// ── Notifications ──────────────────────────────────────────────────────────
export const getNotifications  = () => API.get("/notifications/");
export const getUnreadCount    = () => API.get("/notifications/unread-count");
export const markNotifRead     = (id) => API.put(`/notifications/${id}/read`);
export const markAllRead       = () => API.put("/notifications/read-all");

// ── Manager extras ─────────────────────────────────────────────────────────
export const closePO           = (poId) => API.put(`/manager/close-po/${poId}`);

// ── Legacy stubs (kept to prevent import errors) ──────────────────────────
export const submitQuote = (data) => API.post("/vendor/submit-bid", data);
export const getQuotes   = (id)   => API.get(`/manager/bids/${id}`);
