const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ========================================
// CORS
// ========================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const isLocalDevelopmentOrigin = (origin) => {
  try {
    const url = new URL(origin);

    return (
      ["http:", "https:"].includes(url.protocol) &&
      (url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        /^192\.168\./.test(url.hostname) ||
        /^10\./.test(url.hostname) ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname))
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header
      // such as Postman / Thunder Client.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
        return callback(null, true);
      }

      console.error("Blocked CORS origin:", origin);

      return callback(new Error("CORS: Origin not allowed"));
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],

    credentials: true,
  }),
);

// ========================================
// BODY PARSER
// ========================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// ========================================
// STATIC UPLOADS
// ========================================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========================================
// TEST ROUTE
// ========================================

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Igloo Asset Management API is running",
  });
});

// ========================================
// SETUP
// ========================================

const setupRoutes = require("./routes/setupRoutes");

app.use("/api/setup", setupRoutes);

// ========================================
// AUTHENTICATION
// ========================================

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

// ========================================
// USERS
// ========================================

const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);

// ========================================
// OUTLETS
// ========================================

const outletRoutes = require("./routes/outletRoutes");

app.use("/api/outlets", outletRoutes);

// ========================================
// MANUFACTURERS
// ========================================

const manufacturerRoutes = require("./routes/manufacturerRoutes");

app.use("/api/manufacturers", manufacturerRoutes);

// ========================================
// AUTHORIZATIONS
// ========================================

const authorizationRoutes = require("./routes/authorizationRoutes");

app.use("/api/authorizations", authorizationRoutes);

// ========================================
// ASSETS
// ========================================

const assetRoutes = require("./routes/assets");

app.use("/api/assets", assetRoutes);

// ========================================
// ASSET HISTORY
// ========================================

const assetHistoryRoutes = require("./routes/assetHistory");

app.use("/api/asset-history", assetHistoryRoutes);

// ========================================
// REPAIRS
// ========================================

const repairRoutes = require("./routes/repairs");

app.use("/api/repairs", repairRoutes);

// ========================================
// DISPOSALS
// ========================================

const disposalRoutes = require("./routes/disposals");

app.use("/api/disposals", disposalRoutes);

// ========================================
// CHECK-INS
// ========================================

const checkInRoutes = require("./routes/checkIns");

app.use("/api/check-ins", checkInRoutes);

// ========================================
// VERIFICATION MAPPING
// ========================================

const verificationMappingRoutes = require("./routes/verificationMappings");

app.use("/api/verification-mappings", verificationMappingRoutes);

// ========================================
// ASSET REQUESTS
// ========================================

const assetRequestRoutes = require("./routes/assetRequests");

app.use("/api/asset-requests", assetRequestRoutes);

// ========================================
// REGIONS
// ========================================

const regionRoutes = require("./routes/regionRoutes");

app.use("/api/regions", regionRoutes);

// ========================================
// DISTRICTS
// ========================================

const districtRoutes = require("./routes/districtRoutes");

app.use("/api/districts", districtRoutes);

// ========================================
// DISTRIBUTORS
// ========================================

const distributorRoutes = require("./routes/distributorRoutes");

app.use("/api/distributors", distributorRoutes);

// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found",
  });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);

  // ========================================
  // CORS ERROR
  // ========================================

  if (err.message?.startsWith("CORS:")) {
    return res.status(403).json({
      message: "Request blocked by CORS policy",
    });
  }

  // ========================================
  // GENERAL ERROR
  // ========================================

  return res.status(500).json({
    message: "Something went wrong",
  });
});

module.exports = app;
