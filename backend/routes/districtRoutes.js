const express = require("express");

const {
  createDistrict,
  getDistricts,
  getDistrictById,
  updateDistrict,
  updateDistrictStatus,
} = require("../controllers/districtController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

// ========================================
// GET ALL DISTRICTS
// Permission: districts.view
// ========================================

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("districts", "view"),
  getDistricts
);

// ========================================
// GET ONE DISTRICT
// Permission: districts.view
// ========================================

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("districts", "view"),
  getDistrictById
);

// ========================================
// CREATE DISTRICT
// Permission: districts.add
// ========================================

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("districts", "add"),
  createDistrict
);

// ========================================
// UPDATE DISTRICT
// Permission: districts.update
// ========================================

router.patch(
  "/:id",
  authMiddleware,
  permissionMiddleware("districts", "update"),
  updateDistrict
);

// ========================================
// UPDATE DISTRICT STATUS
// Permission: districts.update
// ========================================

router.patch(
  "/:id/status",
  authMiddleware,
  permissionMiddleware("districts", "update"),
  updateDistrictStatus
);

// ========================================
// EXPORT
// ========================================

module.exports = router;