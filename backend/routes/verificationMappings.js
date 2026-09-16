const express = require("express");

const router = express.Router();

const {
  getAssetByAIN,
  createVerificationMapping,
  getPendingMappings,
  reviewVerificationMapping,
  getMyMappings,
  getVerificationMappingHistory,
  getAssetVerificationHistory,
} = require("../controllers/verificationMappingController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ========================================
// FIND ASSET BY AIN
//
// Permission: verificationMapping.submit
// ========================================

router.get(
  "/asset/ain/:ain",
  authMiddleware,
  permissionMiddleware("verificationMapping", "submit"),
  getAssetByAIN,
);

// ========================================
// ASSET VERIFICATION HISTORY
//
// Permission: verificationMapping.history
// ========================================

router.get(
  "/asset/:assetId",
  authMiddleware,
  permissionMiddleware("verificationMapping", "history"),
  getAssetVerificationHistory,
);

// ========================================
// CREATE MAPPING REQUEST
//
// Permission: verificationMapping.submit
// ========================================

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("verificationMapping", "submit"),
  createVerificationMapping,
);

// ========================================
// MY MAPPING HISTORY
//
// Permission: verificationMapping.history
// ========================================

router.get(
  "/my",
  authMiddleware,
  permissionMiddleware("verificationMapping", "history"),
  getMyMappings,
);

// ========================================
// PENDING MAPPINGS
//
// Permission: verificationMapping.view
// ========================================

router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN", "TSM", "TSO"),
  permissionMiddleware("verificationMapping", "view"),
  getPendingMappings,
);

// ========================================
// VERIFICATION MAPPING HISTORY
//
// Permission: verificationMapping.history
// ========================================

router.get(
  "/history",
  authMiddleware,
  permissionMiddleware("verificationMapping", "history"),
  getVerificationMappingHistory,
);

// ========================================
// APPROVE / REJECT MAPPING
//
// Permission: verificationMapping.approve
// ========================================

router.patch(
  "/:id/review",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN", "TSM", "TSO"),
  permissionMiddleware("verificationMapping", "approve"),
  reviewVerificationMapping,
);

// ========================================
// EXPORT
// ========================================

module.exports = router;
