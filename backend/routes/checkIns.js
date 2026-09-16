const express = require("express");

const router = express.Router();

// ========================================
// IMPORT CONTROLLERS
// ========================================

const {
  createCheckIn,
  getMyCheckInHistory,
  getAllCheckInHistory,
  getLatestCheckIn,
} = require("../controllers/checkInController");

// ========================================
// IMPORT MIDDLEWARE
// ========================================

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

// ========================================
// CREATE CHECK-IN
//
// Permission: checkIns.checkIn
// ========================================

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("checkIns", "checkIn"),
  createCheckIn
);

// ========================================
// GET MY CHECK-IN HISTORY
//
// Permission: checkIns.history
// ========================================

router.get(
  "/history",
  authMiddleware,
  permissionMiddleware("checkIns", "history"),
  getMyCheckInHistory
);

// ========================================
// GET LATEST CHECK-IN
//
// Permission: checkIns.history
// ========================================

router.get(
  "/latest",
  authMiddleware,
  permissionMiddleware("checkIns", "history"),
  getLatestCheckIn
);

// ========================================
// GET ALL USERS' CHECK-IN HISTORY
//
// Permission: checkIns.allHistory
// ========================================

router.get(
  "/all",
  authMiddleware,
  permissionMiddleware("checkIns", "allHistory"),
  getAllCheckInHistory
);

// ========================================
// EXPORT
// ========================================

module.exports = router;