const express = require("express");

const {
  createOutlet,
  getOutlets,
  getOutletById,
  getOutletAssets,
  updateOutlet,
  updateOutletStatus,
} = require("../controllers/outletController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

// ========================================
// GET ALL / SEARCH OUTLETS
// Permission: outlets.view
// ========================================

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("outlets", "view"),
  getOutlets
);

// ========================================
// GET DEPLOYED ASSETS OF OUTLET
// Permission: outlets.view
// ========================================

router.get(
  "/:id/assets",
  authMiddleware,
  permissionMiddleware("outlets", "view"),
  getOutletAssets
);

// ========================================
// GET OUTLET BY ID
// Permission: outlets.view
// ========================================

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("outlets", "view"),
  getOutletById
);

// ========================================
// CREATE OUTLET
// Permission: outlets.add
// ========================================

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("outlets", "add"),
  createOutlet
);

// ========================================
// UPDATE OUTLET
// Permission: outlets.update
// ========================================

router.patch(
  "/:id",
  authMiddleware,
  permissionMiddleware("outlets", "update"),
  updateOutlet
);

// ========================================
// UPDATE OUTLET STATUS
// Permission: outlets.update
// ========================================

router.patch(
  "/:id/status",
  authMiddleware,
  permissionMiddleware("outlets", "update"),
  updateOutletStatus
);

// ========================================
// EXPORT
// ========================================

module.exports = router;