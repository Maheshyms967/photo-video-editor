// ✅ Dynamic base URL (auto switch between local and production)
export const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://127.0.0.1:5000" // local
    : "https://photo-api.proquizzers.com"; // production backend
