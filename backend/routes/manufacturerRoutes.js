const express = require("express");

//Import controllers/manufacturerController
const {
  createManufacturer,
  getManufacturers,
  getManufacturerById,
  updateManufacturer,
  updateManufacturerStatus,
} = require("../controllers/manufacturerController");

//Import Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

// Create a new manufacturer Only SYSTEM_ADMIN can create manufacturers
router.post(
  "/",
  authMiddleware,
  permissionMiddleware("manufacturers", "add"),
  createManufacturer,
);
// Get all manufacturers Any authenticated user can view manufacturers
router.get(
  "/",
  authMiddleware,
  permissionMiddleware("manufacturers", "view"),
  getManufacturers,
);
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("manufacturers", "view"),
  getManufacturerById,
);
router.patch(
  "/:id",
  authMiddleware,
  permissionMiddleware("manufacturers", "update"),
  updateManufacturer,
);
router.patch(
  "/:id/status",
  authMiddleware,
  permissionMiddleware("manufacturers", "changeStatus"),
  updateManufacturerStatus,
);
//Export
module.exports = router;
