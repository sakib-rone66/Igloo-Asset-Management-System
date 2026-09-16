const express = require("express");

const {
  createDistributor,
  getDistributors,
  getDistributorById,
  updateDistributor,
  updateDistributorStatus,
} = require("../controllers/distributorController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

// ========================================
// GET ALL DISTRIBUTORS
// Permission: distributors.view
// ========================================

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("distributors", "view"),
  getDistributors
);

// ========================================
// GET ONE DISTRIBUTOR
// Permission: distributors.view
// ========================================

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("distributors", "view"),
  getDistributorById
);

// ========================================
// CREATE DISTRIBUTOR
// Permission: distributors.add
// ========================================

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("distributors", "add"),
  createDistributor
);

// ========================================
// UPDATE DISTRIBUTOR
// Permission: distributors.update
// ========================================

router.patch(
  "/:id",
  authMiddleware,
  permissionMiddleware("distributors", "update"),
  updateDistributor
);

// ========================================
// UPDATE DISTRIBUTOR STATUS
// Permission: distributors.update
// ========================================

router.patch(
  "/:id/status",
  authMiddleware,
  permissionMiddleware("distributors", "update"),
  updateDistributorStatus
);

// ========================================
// EXPORT
// ========================================

module.exports = router;