const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createRepair,
  getMyRepairs,
  getPendingRepairs,
  approveRepair,
  rejectRepair,
  updateRepairStatus,
  getRepairHistory,
  getRepairAssetByAIN,
  getUnderRepairAssets,
} = require("../controllers/repairController");

// ========================================
// TECHNICIAN
// CREATE REPAIR REQUEST
// ========================================

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("repairs", "create"),
  createRepair,
);

// ========================================
// MY REPAIR REQUESTS
// ========================================

router.get(
  "/my",
  authMiddleware,
  permissionMiddleware("repairs", "create"),
  getMyRepairs,
);

// ========================================
// ADMIN - PENDING REQUESTS
// ========================================

router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN", "TSM", "TSO"),
  permissionMiddleware("repairs", "view"),
  getPendingRepairs,
);

// ========================================
// ADMIN - APPROVE
// ========================================

router.put(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN", "TSM", "TSO"),
  permissionMiddleware("repairs", "approve"),
  approveRepair,
);

// ========================================
// ADMIN - REJECT
// ========================================

router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN", "TSM", "TSO"),
  permissionMiddleware("repairs", "reject"),
  rejectRepair,
);

// ========================================
// UPDATE REPAIR STATUS
// ========================================

router.put(
  "/:id/status",
  authMiddleware,
  permissionMiddleware("repairs", "update"),
  updateRepairStatus,
);

// ========================================
// REPAIR HISTORY BY ASSET
// ========================================

router.get(
  "/asset/ain/:ain",
  authMiddleware,
  permissionMiddleware("repairs", "view"),
  getRepairAssetByAIN,
);

router.get(
  "/asset/:assetId",
  authMiddleware,
  permissionMiddleware("repairs", "view"),
  getRepairHistory,
);

// ========================================
// ASSETS UNDER REPAIR
// ========================================

router.get(
  "/under-repair",
  authMiddleware,
  permissionMiddleware("repairs", "view"),
  getUnderRepairAssets,
);

module.exports = router;
