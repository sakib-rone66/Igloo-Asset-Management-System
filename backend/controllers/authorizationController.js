const Authorization = require("../models/Authorization");
const Manufacturer = require("../models/Manufacturer");
const {
  getRequesterAso,
  canReviewRequest,
  asoRequestFilter,
} = require("../utils/asoApproval");
const Outlet = require("../models/Outlet");
const Asset = require("../models/Asset");

const { getNextSequence } = require("../services/counterService");
const { generateAIN } = require("../services/ainService");

// ============================================================
// HELPER
// ============================================================

const validateAssetInformation = async ({
  capacity,
  manufacturingMonth,
  manufacturingYear,
  manufacturer,
}) => {
  // ========================================
  // REQUIRED FIELDS
  // ========================================

  if (
    capacity === undefined ||
    manufacturingMonth === undefined ||
    manufacturingYear === undefined ||
    !manufacturer
  ) {
    return {
      valid: false,
      status: 400,
      message:
        "Capacity, manufacturing month, manufacturing year and manufacturer are required",
    };
  }

  // ========================================
  // CAPACITY
  // ========================================

  if (Number(capacity) < 1) {
    return {
      valid: false,
      status: 400,
      message: "Capacity must be greater than 0",
    };
  }

  // ========================================
  // MANUFACTURING MONTH
  // ========================================

  if (Number(manufacturingMonth) < 1 || Number(manufacturingMonth) > 12) {
    return {
      valid: false,
      status: 400,
      message: "Manufacturing month must be between 1 and 12",
    };
  }

  // ========================================
  // MANUFACTURING YEAR
  // ========================================

  if (Number(manufacturingYear) < 2000) {
    return {
      valid: false,
      status: 400,
      message: "Manufacturing year must be 2000 or later",
    };
  }

  // ========================================
  // MANUFACTURER
  // ========================================

  const manufacturerData = await Manufacturer.findById(manufacturer);

  if (!manufacturerData) {
    return {
      valid: false,
      status: 404,
      message: "Manufacturer not found",
    };
  }

  // ========================================
  // MANUFACTURER STATUS
  // ========================================

  if (manufacturerData.status !== "ACTIVE") {
    return {
      valid: false,
      status: 400,
      message: "This manufacturer is currently inactive",
    };
  }

  return {
    valid: true,
    manufacturerData,
  };
};

// ============================================================
// CREATE NEW ASSET AUTHORIZATION
// POST /authorizations
// ============================================================

const createAuthorization = async (req, res) => {
  try {
    const { capacity, manufacturingMonth, manufacturingYear, manufacturer } =
      req.body;

    // ========================================
    // VALIDATE ASSET INFORMATION
    // ========================================

    const validation = await validateAssetInformation({
      capacity,
      manufacturingMonth,
      manufacturingYear,
      manufacturer,
    });

    if (!validation.valid) {
      return res.status(validation.status).json({
        message: validation.message,
      });
    }

    // ========================================
    // CREATE NEW ASSET AUTHORIZATION
    // ========================================

    const assignedAso = await getRequesterAso(req.user.userId);

    const authorization = await Authorization.create({
      assetType: "NEW",

      capacity: Number(capacity),

      manufacturingMonth: Number(manufacturingMonth),

      manufacturingYear: Number(manufacturingYear),

      manufacturer,

      // New asset has no outlet yet
      currentOutlet: null,

      requestedBy: req.user.userId,
      assignedAso,

      status: "PENDING",
    });

    return res.status(201).json({
      message: "New asset authorization request created successfully",

      authorization,
    });
  } catch (error) {
    console.error("Create New Authorization Error:", error);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ============================================================
// CREATE EXISTING ASSET AUTHORIZATION
// POST /authorizations/existing
// ============================================================

const createExistingAssetAuthorization = async (req, res) => {
  try {
    const {
      capacity,
      manufacturingMonth,
      manufacturingYear,
      manufacturer,
      currentOutlet,
    } = req.body;

    // ========================================
    // REQUIRED OUTLET
    // ========================================

    if (!currentOutlet) {
      return res.status(400).json({
        message: "Current outlet is required for an existing asset",
      });
    }

    // ========================================
    // VALIDATE ASSET INFORMATION
    // ========================================

    const validation = await validateAssetInformation({
      capacity,
      manufacturingMonth,
      manufacturingYear,
      manufacturer,
    });

    if (!validation.valid) {
      return res.status(validation.status).json({
        message: validation.message,
      });
    }

    // ========================================
    // CHECK OUTLET
    // ========================================

    const outletData = await Outlet.findById(currentOutlet);

    if (!outletData) {
      return res.status(404).json({
        message: "Outlet not found",
      });
    }

    // ========================================
    // CHECK OUTLET STATUS
    // ========================================

    if (outletData.status && outletData.status === "INACTIVE") {
      return res.status(400).json({
        message: "This outlet is currently inactive",
      });
    }

    // ========================================
    // CREATE EXISTING ASSET AUTHORIZATION
    // ========================================

    const assignedAso = await getRequesterAso(req.user.userId);

    const authorization = await Authorization.create({
      assetType: "EXISTING",

      capacity: Number(capacity),

      manufacturingMonth: Number(manufacturingMonth),

      manufacturingYear: Number(manufacturingYear),

      manufacturer,

      // IMPORTANT:
      // Existing freezer is already deployed
      // at this outlet.
      currentOutlet,

      requestedBy: req.user.userId,
      assignedAso,

      status: "PENDING",
    });

    return res.status(201).json({
      message: "Existing asset authorization request created successfully",

      authorization,
    });
  } catch (error) {
    console.error("Create Existing Asset Authorization Error:", error);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ============================================================
// GET ALL AUTHORIZATIONS
// GET /authorizations
// ============================================================

const getAuthorizations = async (req, res) => {
  try {
    const authorizations = await Authorization.find(await asoRequestFilter(req))
      .populate("manufacturer", "name code")
      .populate("currentOutlet", "name code")
      .populate("requestedBy", "name email")
      .populate("approvedBy", "name email")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message: "Authorization requests fetched successfully",

      count: authorizations.length,

      authorizations,
    });
  } catch (error) {
    console.error("Get Authorizations Error:", error);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ============================================================
// GET MY AUTHORIZATIONS
// ============================================================

const getMyAuthorizations = async (req, res) => {
  try {
    const authorizations = await Authorization.find({
      requestedBy: req.user.userId,
    })
      .populate("manufacturer", "name code")
      .populate("currentOutlet", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Your authorization requests fetched successfully",
      count: authorizations.length,
      authorizations,
    });
  } catch (error) {
    console.error("Get My Authorizations Error:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ============================================================
// GET ONE AUTHORIZATION
// GET /authorizations/:id
// ============================================================

const getAuthorizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const authorization = await Authorization.findById(id)
      .populate("manufacturer", "name code")
      .populate("currentOutlet", "name code")
      .populate("requestedBy", "name email")
      .populate("approvedBy", "name email");

    if (!authorization) {
      return res.status(404).json({
        message: "Authorization request not found",
      });
    }

    if (!(await canReviewRequest(req, authorization))) {
      return res
        .status(403)
        .json({ message: "This request is assigned to a different ASO." });
    }

    return res.status(200).json({
      message: "Authorization request fetched successfully",

      authorization,
    });
  } catch (error) {
    console.error("Get Authorization By ID Error:", error);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ============================================================
// APPROVE / REJECT AUTHORIZATION
// PATCH /authorizations/:id/decision
// ============================================================

const updateAuthorizationDecision = async (req, res) => {
  try {
    const { id } = req.params;

    const { decision, rejectionReason } = req.body;

    // ========================================
    // VALIDATE DECISION
    // ========================================

    if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
      return res.status(400).json({
        message: "Decision must be APPROVED or REJECTED",
      });
    }

    // ========================================
    // REJECTION REASON
    // ========================================

    if (decision === "REJECTED" && !rejectionReason?.trim()) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    // ========================================
    // FIND AUTHORIZATION
    // ========================================

    const authorization = await Authorization.findById(id);

    if (!authorization) {
      return res.status(404).json({
        message: "Authorization request not found",
      });
    }

    if (!(await canReviewRequest(req, authorization))) {
      return res
        .status(403)
        .json({ message: "This request is assigned to a different ASO." });
    }

    // ========================================
    // PREVENT SELF APPROVAL
    // ========================================

    if (
      authorization.requestedBy.toString() === req.user.userId.toString() &&
      req.user.role !== "SYSTEM_ADMIN"
    ) {
      return res.status(403).json({
        message: "You cannot approve or reject your own authorization request",
      });
    }

    // ========================================
    // PREVENT DUPLICATE DECISION
    // ========================================

    if (authorization.status !== "PENDING") {
      return res.status(400).json({
        message: `Authorization is already ${authorization.status}`,
      });
    }

    // ========================================
    // HANDLE APPROVAL
    // ========================================

    if (decision === "APPROVED") {
      // ========================================
      // GENERATE SERIAL NUMBER
      // ========================================

      const serialNumber = await getNextSequence("ASSET_SN");

      const formattedSN = serialNumber.toString().padStart(6, "0");

      // ========================================
      // GET MANUFACTURER
      // ========================================

      const manufacturerData = await Manufacturer.findById(
        authorization.manufacturer,
      );

      if (!manufacturerData) {
        return res.status(404).json({
          message: "Manufacturer not found",
        });
      }

      // ========================================
      // GENERATE AIN
      // ========================================

      const ain = generateAIN(
        authorization.capacity,
        authorization.manufacturingMonth,
        authorization.manufacturingYear,
        manufacturerData.code,
        formattedSN,
      );

      // ========================================
      // DETERMINE ASSET STATUS
      // ========================================

      let assetStatus = "IN_STOCK";

      let assetOutlet = null;

      // ========================================
      // EXISTING ASSET
      // ========================================

      if (authorization.assetType === "EXISTING") {
        // Existing freezer is already
        // deployed at an outlet.

        if (!authorization.currentOutlet) {
          return res.status(400).json({
            message: "Existing asset authorization has no current outlet",
          });
        }

        // Keep its existing outlet
        assetOutlet = authorization.currentOutlet;

        // Existing deployed asset
        // must be ASSIGNED.
        assetStatus = "ASSIGNED";
      }

      // ========================================
      // NEW ASSET
      // ========================================

      if (authorization.assetType === "NEW") {
        // New asset has no outlet.
        assetOutlet = null;

        // New asset goes to warehouse.
        assetStatus = "IN_STOCK";
      }

      // ========================================
      // CREATE ASSET
      // ========================================

      const asset = await Asset.create({
        ain,

        serialNumber: formattedSN,

        capacity: authorization.capacity,

        manufacturingMonth: authorization.manufacturingMonth,

        manufacturingYear: authorization.manufacturingYear,

        manufacturer: authorization.manufacturer,

        authorization: authorization._id,

        // Existing asset keeps
        // assigned outlet.
        currentOutlet: assetOutlet,

        // Existing = ASSIGNED
        // New = IN_STOCK
        status: assetStatus,
      });

      // ========================================
      // UPDATE AUTHORIZATION
      // ========================================

      authorization.status = "APPROVED";

      authorization.approvedBy = req.user.userId;

      authorization.decisionDate = new Date();

      authorization.rejectionReason = null;

      await authorization.save();

      console.log("Asset Type:", authorization.assetType);

      console.log("Generated SN:", formattedSN);

      console.log("Generated AIN:", ain);

      console.log("Asset Status:", assetStatus);

      console.log("Current Outlet:", assetOutlet);

      console.log("Asset Created Successfully");

      // ========================================
      // RESPONSE
      // ========================================

      return res.status(200).json({
        message: "Authorization approved successfully and asset registered",

        authorization,

        asset,
      });
    }

    // ========================================
    // HANDLE REJECTION
    // ========================================

    authorization.status = "REJECTED";

    authorization.approvedBy = req.user.userId;

    authorization.decisionDate = new Date();

    authorization.rejectionReason = rejectionReason.trim();

    await authorization.save();

    return res.status(200).json({
      message: "Authorization rejected successfully",

      authorization,
    });
  } catch (error) {
    console.error("Update Authorization Decision Error:", error);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  createAuthorization,
  createExistingAssetAuthorization,
  getAuthorizations,
  getMyAuthorizations,
  getAuthorizationById,
  updateAuthorizationDecision,
};
