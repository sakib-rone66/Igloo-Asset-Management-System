// ========================================
// LOAD ENVIRONMENT VARIABLES FIRST
// ========================================

const dotenv = require("dotenv");

dotenv.config();

// ========================================
// IMPORT APP + DATABASE
// ========================================

const app = require("./app");
const connectDB = require("./config/db");
const {
  syncAsoPermissions,
  syncAsoSupervisors,
  syncTsoPermissions,
  syncTechnicianPermissions,
  syncTsmPermissions,
} = require("./services/asoAccessService");

// ========================================
// SERVER PORT
// ========================================

const PORT = process.env.PORT || 3000;

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
  try {
    // ========================================
    // CONNECT TO MONGODB
    // ========================================

    await connectDB();

    // Apply the default ASO access profile to all existing ASOs.
    await syncAsoPermissions();

    // Apply the default TSO access profile to all existing TSOs.
    await syncTsoPermissions();

    // Place existing unassigned ASOs under the earliest active TSO.
    await syncAsoSupervisors();

    // Apply the default Technician access profile to all existing Technicians.
    await syncTechnicianPermissions();

    // Apply the default TSM access profile to all existing TSMs.
    await syncTsmPermissions();

    // ========================================
    // START EXPRESS SERVER
    //
    // 0.0.0.0 allows access from:
    // PC localhost
    // PC LAN IP
    // Phone on same Wi-Fi
    // ========================================

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${PORT}`);

      console.log(`💻 PC: http://localhost:${PORT}`);

      console.log(`🌐 LAN: http://YOUR-PC-IP:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server Start Error:", error.message);

    process.exit(1);
  }
};

// ========================================
// RUN SERVER
// ========================================

startServer();
