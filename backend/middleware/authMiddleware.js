const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ========================================
// AUTHENTICATION MIDDLEWARE
// ========================================

const authMiddleware = async (req, res, next) => {
  try {
    // ========================================
    // GET AUTHORIZATION HEADER
    // ========================================

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header is required.",
      });
    }

    // ========================================
    // CHECK BEARER TOKEN
    // ========================================

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format.",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is required.",
      });
    }

    // ========================================
    // VERIFY JWT
    // ========================================

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ========================================
    // VALIDATE JWT PAYLOAD
    // ========================================

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // ========================================
    // FIND CURRENT USER
    // ========================================
    //
    // IMPORTANT:
    //
    // We fetch the user from MongoDB on every
    // authenticated request.
    //
    // This ensures req.user always contains
    // the latest:
    //
    // - role
    // - status
    // - permissions
    //
    // Therefore, when System Admin changes a
    // user's access rights, the change takes
    // effect without requiring a new login.
    //
    // ========================================

    const user = await User.findById(decoded.userId).select(
      "_id name email phone address profilePicture role status permissions",
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
    // STORE CURRENT USER IN REQUEST
    // ========================================

    req.user = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      profilePicture: user.profilePicture || "",
      role: user.role,
      status: user.status,

      // Current permissions from MongoDB
      permissions: user.permissions || {},
    };

    // ========================================
    // CONTINUE
    // ========================================

    return next();
  } catch (error) {
    // ========================================
    // JWT ERRORS
    // ========================================

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Authentication token has expired.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // ========================================
    // CAST / INVALID USER ID
    // ========================================

    if (error.name === "CastError") {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // ========================================
    // OTHER ERRORS
    // ========================================

    console.error("Auth Middleware Error:", error);

    return res.status(500).json({
      message: "Authentication failed.",
    });
  }
};

module.exports = authMiddleware;
