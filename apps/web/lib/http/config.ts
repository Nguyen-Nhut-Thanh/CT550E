// Browsers use the page's own origin, including on phones and public networks.
// Next.js proxies /api/* to the backend; server rendering calls it directly.
export const API_BASE = typeof window === "undefined"
  ? process.env.API_INTERNAL_URL?.replace(/\/+$/, "") || "http://127.0.0.1:4000"
  : "/api";
