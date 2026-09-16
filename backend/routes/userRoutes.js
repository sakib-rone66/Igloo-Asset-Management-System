const express = require("express");

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  getMyProfile,
  updateMyProfile,
  uploadMyProfilePicture,
  updateUserPermissions,
  getUserPermissions,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const uploadProfilePicture = require("../middleware/uploadProfilePicture");

const router = express.Router();

// ========================================
// MY PROFILE
// ========================================

// Any authenticated user
router.get("/me", authMiddleware, getMyProfile);

router.patch("/me", authMiddleware, updateMyProfile);

router.patch(
  "/me/profile-picture",
  authMiddleware,
  uploadProfilePicture.single("profilePicture"),
  uploadMyProfilePicture,
);

// ========================================
// USER MANAGEMENT
// ========================================

// Get all users
router.get(
  "/",
  authMiddleware,
  permissionMiddleware("users", "view"),
  getUsers,
);

// ========================================
// USER ACCESS RIGHTS
// ========================================

// Get user's access rights
router.get(
  "/:id/permissions",
  authMiddleware,
  permissionMiddleware("users", "update"),
  getUserPermissions,
);

// Update user's access rights
router.patch(
  "/:id/permissions",
  authMiddleware,
  permissionMiddleware("users", "update"),
  updateUserPermissions,
);

// ========================================
// GET ONE USER
// ========================================

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("users", "view"),
  getUserById,
);

// ========================================
// CREATE USER
// ========================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN"),
  permissionMiddleware("users", "add"),
  createUser,
);

// ========================================
// ACTIVATE / DEACTIVATE USER
// ========================================

router.patch(
  "/:id/status",
  authMiddleware,
  permissionMiddleware("users", "changeStatus"),
  updateUserStatus,
);

// ========================================
// UPDATE ANOTHER USER
// ========================================

router.patch(
  "/:id",
  authMiddleware,
  permissionMiddleware("users", "update"),
  updateUser,
);

module.exports = router;
