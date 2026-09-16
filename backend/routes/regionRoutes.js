const express = require("express");

const {
  createRegion,
  getRegions,
  getRegionById,
  updateRegion,
  updateRegionStatus,
} = require("../controllers/regionController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

// ========================================
// GET ALL REGIONS
// Permission: regions.view
// ========================================

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("regions", "view"),
  getRegions
);

// ========================================
// GET ONE REGION
// Permission: regions.view
// ========================================

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("regions", "view"),
  getRegionById
);

// ========================================
// CREATE REGION
// Permission: regions.add
// ========================================

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("regions", "add"),
  createRegion
);

// ========================================
// UPDATE REGION
// Permission: regions.update
// ========================================

router.patch(
  "/:id",
  authMiddleware,
  permissionMiddleware("regions", "update"),
  updateRegion
);

// ========================================
// UPDATE REGION STATUS
// Permission: regions.update
// ========================================

router.patch(
  "/:id/status",
  authMiddleware,
  permissionMiddleware("regions", "update"),
  updateRegionStatus
);

// ========================================
// EXPORT
// ========================================

module.exports = router;