const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Import User model
const User = require("../models/User");

// Import email service
const { sendPasswordResetEmail } = require("../services/emailService");

// ========================================
// LOGIN USER
// ========================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Use the same message for security
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if account is active
    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    // Compare entered password with stored bcrypt hash
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    // Password does not match
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT payload
    const payload = {
      userId: user._id,
      role: user.role,
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Login successful
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        profilePicture: user.profilePicture || "",
        role: user.role,
        status: user.status,
        permissions: user.permissions || {},
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET PROTECTED PROFILE
// ========================================

const getProfile = async (req, res) => {
  try {
    // req.user comes from authMiddleware
    return res.status(200).json({
      message: "Profile accessed successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("Profile Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// CHANGE PASSWORD
// ========================================

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message:
          "Current password, new password and confirm password are required",
      });
    }

    // Check new password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    // Prevent using the same password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // Find authenticated user
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check account status
    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    // Verify current password
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// FORGOT PASSWORD
// ========================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    /*
     * Security:
     * Do not reveal whether the email exists
     * in the system.
     */
    if (!user || user.status !== "ACTIVE") {
      return res.status(200).json({
        message:
          "If an account with this email exists, a password reset link has been sent.",
      });
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing in MongoDB
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires after 15 minutes
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Save hashed token and expiration
    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = resetTokenExpires;

    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      console.error("Password Reset Email Error:", emailError.message);

      // Remove reset token if email could not be sent
      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      await user.save();

      return res.status(500).json({
        message: "Unable to send password reset email. Please try again later.",
      });
    }

    /*
     * IMPORTANT:
     * Never return the reset token to the frontend.
     * The token is sent only through email.
     */
    return res.status(200).json({
      message:
        "If an account with this email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// RESET PASSWORD
// ========================================

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { newPassword, confirmPassword } = req.body;

    // ========================================
    // VALIDATE TOKEN
    // ========================================

    if (!token) {
      return res.status(400).json({
        message: "Reset token is required",
      });
    }

    // ========================================
    // VALIDATE PASSWORDS
    // ========================================

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password are required",
      });
    }

    // ========================================
    // CHECK PASSWORD CONFIRMATION
    // ========================================

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    // ========================================
    // HASH RESET TOKEN
    // ========================================

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // ========================================
    // FIND USER WITH VALID RESET TOKEN
    // ========================================

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: new Date(),
      },
    });

    // Token invalid or expired
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired password reset token",
      });
    }

    // ========================================
    // CHECK ACCOUNT STATUS
    // ========================================

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    // ========================================
    // PREVENT REUSING CURRENT PASSWORD
    // ========================================

    /*
     * The existing password is stored as a bcrypt hash.
     *
     * Therefore, we cannot compare:
     *
     * newPassword === user.password
     *
     * Instead, bcrypt.compare() checks whether the
     * newly entered password matches the existing
     * password hash.
     */
    const isSameAsCurrentPassword = await bcrypt.compare(
      newPassword,
      user.password,
    );

    if (isSameAsCurrentPassword) {
      return res.status(400).json({
        message: "New password must be different from your current password",
      });
    }

    // ========================================
    // HASH NEW PASSWORD
    // ========================================

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ========================================
    // UPDATE PASSWORD
    // ========================================

    user.password = hashedPassword;

    // ========================================
    // INVALIDATE RESET TOKEN
    // ========================================

    /*
     * IMPORTANT:
     * The reset token can only be used once.
     */
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    // ========================================
    // SUCCESS
    // ========================================

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  loginUser,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
