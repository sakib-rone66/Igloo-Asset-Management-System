const User = require("../models/User");

// ========================================
// PERMISSION MIDDLEWARE
// ========================================

const permissionMiddleware = (group, permission) => {
  return async (req, res, next) => {
    try {
      // ========================================
      // AUTHENTICATION CHECK
      // ========================================

      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required.",
        });
      }

      // ========================================
      // SYSTEM ADMIN
      // ========================================
      //
      // System Admin has full access.
      // No manually assigned permission is required.
      //
      // ========================================

      if (req.user.role === "SYSTEM_ADMIN") {
        return next();
      }

      // ========================================
      // FIND CURRENT USER
      // ========================================
      //
      // Get the latest permissions directly
      // from MongoDB.
      //
      // This means Admin changes take effect
      // without requiring the user to log in again.
      //
      // ========================================

      const user = await User.findById(req.user.userId).select(
        "role status permissions",
      );

      // ========================================
      // USER NOT FOUND
      // ========================================

      if (!user) {
        return res.status(401).json({
          message: "User account not found.",
        });
      }

      // ========================================
      // ACCOUNT STATUS
      // ========================================

      if (user.status !== "ACTIVE") {
        return res.status(403).json({
          message: "Your account is inactive.",
        });
      }

      // ========================================
      // USER ROLE
      // ========================================

      // Keep the latest role available in req.user.
      req.user.role = user.role;

      // ========================================
      // USER PERMISSIONS
      // ========================================

      const permissions = user.permissions;

      if (!permissions || typeof permissions !== "object") {
        return res.status(403).json({
          message: "You do not have permission to perform this action.",
        });
      }

      // ========================================
      // CHECK PERMISSION GROUP
      // ========================================

      const groupPermissions = permissions[group];

      if (!groupPermissions || typeof groupPermissions !== "object") {
        return res.status(403).json({
          message: "You do not have permission to perform this action.",
        });
      }

      // ========================================
      // CHECK SPECIFIC PERMISSION
      // ========================================

      if (groupPermissions[permission] !== true) {
        return res.status(403).json({
          message: "You do not have permission to perform this action.",
        });
      }

      // ========================================
      // PERMISSION GRANTED
      // ========================================

      next();
    } catch (error) {
      console.error("Permission Middleware Error:", error);

      return res.status(500).json({
        message: "Permission verification failed.",
      });
    }
  };
};

module.exports = permissionMiddleware;
