const express = require("express");

const router = express.Router();

const {
  getAssetHistory,
} = require("../controllers/assetHistoryController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

// ========================================
// GET HISTORY OF ONE ASSET
//
// Permission: assets.view
// ========================================

router.get(
  "/:assetId",
  authMiddleware,
  permissionMiddleware("assets", "view"),
  getAssetHistory
);

// ========================================
// EXPORT
// ========================================

module.exports = router;