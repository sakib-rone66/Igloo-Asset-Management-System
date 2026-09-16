import axios from "axios";

// ========================================
// API BASE URL
// ========================================
const apiBaseUrl =
  window.location.protocol === "https:"
    ? "/api"
    : `http://${window.location.hostname}:3000/api`;

const api = axios.create({
  baseURL: apiBaseUrl,

  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================
// REQUEST INTERCEPTOR
// Automatically attach JWT token to every protected API request.
// ========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ========================================
// RESPONSE INTERCEPTOR
// If the backend says the token is invalid or expired, remove stored login data.
// ========================================
api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  },
);

// EXPORT
export default api;
