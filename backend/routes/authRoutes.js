const express = require("express");

const router = express.Router();

const {
  loginUser,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// ========================================
// USER LOGIN
// PUBLIC
// ========================================

router.post(
  "/login",
  loginUser
);

// ========================================
// PROTECTED PROFILE
// ========================================

router.get(
  "/profile",
  authMiddleware,
  getProfile
);

// ========================================
// CHANGE OWN PASSWORD
// ANY AUTHENTICATED USER
// ========================================

router.patch(
  "/change-password",
  authMiddleware,
  changePassword
);

// ========================================
// FORGOT PASSWORD
// PUBLIC
// ========================================

router.post(
  "/forgot-password",
  forgotPassword
);

// ========================================
// RESET PASSWORD
// PUBLIC WITH RESET TOKEN
// ========================================

router.post(
  "/reset-password/:token",
  resetPassword
);

// ========================================
// EXPORT
// ========================================

module.exports = router;