const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const User = require("../models/User");
const Region = require("../models/Region");
const {
  getAsoPermissions,
  getTechnicianPermissions,
  getTsoPermissions,
  getTsmPermissions,
} = require("../services/asoAccessService");

// ========================================
// CREATE USER
// ========================================

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, assignedAso, assignedTso, regionId } =
      req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    // Prevent creating another System Admin
    if (role === "SYSTEM_ADMIN") {
      return res.status(403).json({
        message: "Cannot create another System Admin",
      });
    }

    let asoId = null;
    let tsoId = null;
    let selectedRegion = null;

    if (["ASO", "TECHNICIAN"].includes(role)) {
      if (!assignedTso || !mongoose.Types.ObjectId.isValid(assignedTso)) {
        return res
          .status(400)
          .json({ message: "A TSO must be assigned to this user" });
      }

      const tso = await User.findOne({
        _id: assignedTso,
        role: "TSO",
        status: "ACTIVE",
      });

      if (!tso) {
        return res
          .status(400)
          .json({ message: "Selected TSO is not available" });
      }

      tsoId = tso._id;
    }

    if (role === "TSM") {
      if (!regionId || !mongoose.Types.ObjectId.isValid(regionId)) {
        return res.status(400).json({
          message: "A region must be selected for a TSM",
        });
      }

      selectedRegion = await Region.findOne({
        _id: regionId,
        status: "ACTIVE",
      });

      if (!selectedRegion) {
        return res.status(400).json({
          message: "Selected region is not available",
        });
      }
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const permissions =
      role === "ASO"
        ? await getAsoPermissions()
        : role === "TSO"
          ? await getTsoPermissions()
          : role === "TECHNICIAN"
            ? await getTechnicianPermissions()
            : role === "TSM"
              ? await getTsmPermissions()
              : undefined;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      assignedAso: null,
      assignedTso: ["ASO", "TECHNICIAN"].includes(role) ? tsoId : null,
      region: selectedRegion?._id || null,
      ...(permissions ? { permissions } : {}),
    });

    // Return safe user data
    return res.status(201).json({
      message: "User created successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profilePicture,
        role: user.role,
        region: user.region,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create User Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET ALL USERS
// ========================================

const getUsers = async (req, res) => {
  try {
    // Get all users from database
    const users = await User.find()
      .select("-password -passwordResetToken -passwordResetExpires")
      .populate({
        path: "assignedAso",
        select: "name email role assignedTso",
        populate: { path: "assignedTso", select: "name email role" },
      })
      .populate("assignedTso", "name email role")
      .populate("region", "name code status")
      .sort({ name: 1 });

    return res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET USER BY ID
// ========================================

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Find user and exclude sensitive fields
    const user = await User.findById(id)
      .select("-password -passwordResetToken -passwordResetExpires")
      .populate({
        path: "assignedAso",
        select: "name email role assignedTso",
        populate: { path: "assignedTso", select: "name email role" },
      })
      .populate("assignedTso", "name email role");

    // User not found
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get User Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// UPDATE USER
// SYSTEM ADMIN ONLY
// ========================================

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      phone,
      address,
      role,
      password,
      assignedAso,
      assignedTso,
      regionId,
    } = req.body;

    // Check if user ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Find the user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ========================================
    // SYSTEM ADMIN ROLE PROTECTION
    // ========================================

    // Prevent changing System Admin's role
    if (user.role === "SYSTEM_ADMIN" && role && role !== "SYSTEM_ADMIN") {
      return res.status(403).json({
        message: "Cannot change System Admin role",
      });
    }

    // Prevent assigning SYSTEM_ADMIN role
    if (role === "SYSTEM_ADMIN") {
      return res.status(403).json({
        message: "Cannot assign System Admin role",
      });
    }

    // ========================================
    // EMAIL
    // ========================================

    if (email && email.trim().toLowerCase() !== user.email) {
      const normalizedEmail = email.trim().toLowerCase();

      // Check duplicate email
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email is already registered",
        });
      }

      user.email = normalizedEmail;
    }

    // ========================================
    // NAME
    // ========================================

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = typeof phone === "string" ? phone.trim() : "";
    }

    if (address !== undefined) {
      user.address = typeof address === "string" ? address.trim() : "";
    }

    // ========================================
    // ROLE
    // ========================================

    if (role) {
      user.role = role;
    }

    if (user.role === "ASO") {
      user.assignedAso = null;
      user.region = null;
      if (assignedTso !== undefined) {
        if (!assignedTso || !mongoose.Types.ObjectId.isValid(assignedTso)) {
          return res
            .status(400)
            .json({ message: "A TSO must be assigned to this ASO" });
        }

        const tso = await User.findOne({
          _id: assignedTso,
          role: "TSO",
          status: "ACTIVE",
        });
        if (!tso) {
          return res
            .status(400)
            .json({ message: "Selected TSO is not available" });
        }
        user.assignedTso = tso._id;
      }

      if (!user.assignedTso) {
        return res
          .status(400)
          .json({ message: "A TSO must be assigned to this ASO" });
      }

      user.permissions = await getAsoPermissions();
    } else if (user.role === "TSO") {
      user.assignedAso = null;
      user.assignedTso = null;
      user.region = null;
      user.permissions = await getTsoPermissions();
    } else if (user.role === "TSM") {
      const selectedRegionId = regionId === undefined ? user.region : regionId;

      if (
        !selectedRegionId ||
        !mongoose.Types.ObjectId.isValid(selectedRegionId)
      ) {
        return res.status(400).json({
          message: "A region must be selected for this TSM",
        });
      }

      const region = await Region.findOne({
        _id: selectedRegionId,
        status: "ACTIVE",
      });

      if (!region) {
        return res.status(400).json({
          message: "Selected region is not available",
        });
      }

      user.assignedAso = null;
      user.assignedTso = null;
      user.region = region._id;
      user.permissions = await getTsmPermissions();
    } else if (user.role === "TECHNICIAN") {
      if (assignedTso !== undefined) {
        if (!assignedTso || !mongoose.Types.ObjectId.isValid(assignedTso)) {
          return res
            .status(400)
            .json({ message: "A TSO must be assigned to this user" });
        }

        const tso = await User.findOne({
          _id: assignedTso,
          role: "TSO",
          status: "ACTIVE",
        });

        if (!tso) {
          return res
            .status(400)
            .json({ message: "Selected TSO is not available" });
        }

        user.assignedTso = tso._id;
      }

      if (!user.assignedTso) {
        return res
          .status(400)
          .json({ message: "A TSO must be assigned to this user" });
      }

      user.assignedAso = null;
      user.region = null;
      user.permissions = await getTechnicianPermissions();
    } else if (assignedAso !== undefined) {
      if (!assignedAso || !mongoose.Types.ObjectId.isValid(assignedAso)) {
        return res
          .status(400)
          .json({ message: "An ASO must be assigned to this user" });
      }
      const aso = await User.findOne({
        _id: assignedAso,
        role: "ASO",
        status: "ACTIVE",
      });
      if (!aso) {
        return res
          .status(400)
          .json({ message: "Selected ASO is not available" });
      }
      user.assignedAso = aso._id;
      user.assignedTso = null;
    }

    // ========================================
    // PASSWORD
    // ========================================

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Save updated user
    await user.save();

    return res.status(200).json({
      message: "User updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profilePicture,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update User Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// ACTIVATE / DEACTIVATE USER
// SYSTEM ADMIN ONLY
// ========================================

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if user ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Validate status
    if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        message: "Status must be ACTIVE or INACTIVE",
      });
    }

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      req.user.role === "TSM" &&
      !["TSO", "ASO", "TECHNICIAN"].includes(user.role)
    ) {
      return res.status(403).json({
        message:
          "TSM can only activate or deactivate TSO, ASO and Technician users",
      });
    }

    if (
      req.user.role === "TSO" &&
      (!["ASO", "TECHNICIAN"].includes(user.role) ||
        !user.assignedTso ||
        user.assignedTso.toString() !== req.user.userId.toString())
    ) {
      return res.status(403).json({
        message:
          "TSO can only activate or deactivate ASO and Technician users assigned to them",
      });
    }

    // Prevent deactivating System Admin
    if (user.role === "SYSTEM_ADMIN" && status === "INACTIVE") {
      return res.status(403).json({
        message: "Cannot deactivate System Admin",
      });
    }

    // Update status
    user.status = status;

    await user.save();

    return res.status(200).json({
      message: `User status updated to ${status}`,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profilePicture,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Update User Status Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET MY PROFILE
// ANY AUTHENTICATED USER
// ========================================

const getMyProfile = async (req, res) => {
  try {
    // req.user.userId comes from authMiddleware
    const user = await User.findById(req.user.userId).select(
      "-password -passwordResetToken -passwordResetExpires",
    );

    // User not found
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

    return res.status(200).json({
      message: "Profile fetched successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profilePicture,
        role: user.role,
        status: user.status,
        permissions: user.permissions || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get My Profile Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// UPDATE MY PROFILE
// ANY AUTHENTICATED USER
// ========================================

const updateMyProfile = async (req, res) => {
  try {
    const { name, email, phone, address, profilePicture } = req.body;

    // ========================================
    // FIND AUTHENTICATED USER
    // ========================================

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ========================================
    // ACCOUNT STATUS
    // ========================================

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    // ========================================
    // NAME
    // ========================================

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      user.name = name.trim();
    }

    // ========================================
    // EMAIL
    // ANY AUTHENTICATED USER CAN CHANGE EMAIL
    // ========================================

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          message: "Email cannot be empty",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          message: "Please enter a valid email address",
        });
      }

      // Check whether another user already has this email
      if (normalizedEmail !== user.email) {
        const existingUser = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: user._id },
        });

        if (existingUser) {
          return res.status(409).json({
            message: "Email is already registered",
          });
        }

        user.email = normalizedEmail;
      }
    }

    // ========================================
    // PHONE
    // ========================================

    if (phone !== undefined) {
      user.phone = typeof phone === "string" ? phone.trim() : "";
    }

    // ========================================
    // ADDRESS
    // ========================================

    if (address !== undefined) {
      user.address = typeof address === "string" ? address.trim() : "";
    }

    // ========================================
    // PROFILE PICTURE
    // ========================================

    if (profilePicture !== undefined) {
      user.profilePicture =
        typeof profilePicture === "string" ? profilePicture.trim() : "";
    }

    // ========================================
    // SAVE
    // ========================================

    await user.save();

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profilePicture,
        role: user.role,
        status: user.status,
        permissions: user.permissions || {},
      },
    });
  } catch (error) {
    console.error("Update My Profile Error:", error.message);

    // MongoDB duplicate email protection
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const uploadMyProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Profile picture is required",
      });
    }

    // Save public URL/path
    user.profilePicture = `/uploads/profiles/${req.file.filename}`;

    await user.save();

    return res.status(200).json({
      message: "Profile picture updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profilePicture,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Upload Profile Picture Error:", error.message);

    return res.status(500).json({
      message: "Unable to upload profile picture",
    });
  }
};

// ========================================
// UPDATE USER ACCESS RIGHTS
// SYSTEM ADMIN ONLY
// ========================================

const updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    // ========================================
    // VALIDATE USER ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    // ========================================
    // VALIDATE PERMISSIONS
    // ========================================

    if (
      !permissions ||
      typeof permissions !== "object" ||
      Array.isArray(permissions)
    ) {
      return res.status(400).json({
        message: "Valid permissions are required.",
      });
    }

    // ========================================
    // FIND USER
    // ========================================

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // ========================================
    // SYSTEM ADMIN PROTECTION
    // ========================================

    if (user.role === "SYSTEM_ADMIN") {
      return res.status(403).json({
        message:
          "Access rights cannot be manually configured for the System Admin.",
      });
    }

    // ========================================
    // UPDATE PERMISSIONS
    // ========================================

    user.permissions = permissions;

    await user.save();

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: "User access rights updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profilePicture,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    console.error("Update User Permissions Error:", error);

    return res.status(500).json({
      message: "Failed to update user access rights.",
    });
  }
};

// ========================================
// GET USER ACCESS RIGHTS
// SYSTEM ADMIN ONLY
// ========================================

const getUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================
    // VALIDATE USER ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    // ========================================
    // FIND USER
    // ========================================

    const user = await User.findById(id).select(
      "name email phone address profilePicture role status permissions",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: "User access rights retrieved successfully.",
      user,
    });
  } catch (error) {
    console.error("Get User Permissions Error:", error);

    return res.status(500).json({
      message: "Failed to retrieve user access rights.",
    });
  }
};

// EXPORT
module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  getMyProfile,
  updateMyProfile,
  uploadMyProfilePicture,
  // Access Rights
  updateUserPermissions,
  getUserPermissions,
};
