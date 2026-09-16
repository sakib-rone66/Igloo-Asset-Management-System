const mongoose = require("mongoose");
const VerificationMapping = require("../models/VerificationMapping");
const Asset = require("../models/Asset");
const Outlet = require("../models/Outlet");
const {
  getRequesterAso,
  canReviewRequest,
  asoRequestFilter,
} = require("../utils/asoApproval");

// ========================================
// FIND ASSET BY AIN
// ========================================

const getAssetByAIN = async (req, res) => {
  try {
    const { ain } = req.params;

    if (!ain || !ain.trim()) {
      return res.status(400).json({
        message: "AIN is required",
      });
    }

    // ========================================
    // FIND ASSET
    // ========================================

    const asset = await Asset.findOne({
      ain: ain.trim(),
    })
      .populate("currentOutlet", "name code address contactPerson phone status")
      .populate("manufacturer", "name code");

    if (!asset) {
      return res.status(404).json({
        message: "Asset with this AIN was not found",
      });
    }

    // ========================================
    // DISPOSED ASSET
    // ========================================

    if (asset.status === "DISPOSED") {
      return res.status(400).json({
        message: "Disposed asset cannot be mapped",
      });
    }

    // ========================================
    // ASSET MUST HAVE CURRENT OUTLET
    // ========================================

    if (!asset.currentOutlet) {
      return res.status(400).json({
        message: "This asset is not currently assigned to an outlet",
      });
    }

    return res.status(200).json({
      message: "Asset found successfully",

      asset: {
        _id: asset._id,

        ain: asset.ain,

        serialNumber: asset.serialNumber,

        capacity: asset.capacity,

        status: asset.status,

        isActivated: asset.isActivated,

        verificationStatus: asset.verificationStatus,

        manufacturer: asset.manufacturer,

        currentOutlet: asset.currentOutlet,
      },
    });
  } catch (error) {
    console.error("Get Asset By AIN Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// CREATE VERIFICATION MAPPING REQUEST
// ========================================

const createVerificationMapping = async (req, res) => {
  try {
    const { ain, outletId, remarks } = req.body;

    // ========================================
    // REQUIRED
    // ========================================

    if (!ain || !ain.trim()) {
      return res.status(400).json({
        message: "AIN is required",
      });
    }

    if (!outletId) {
      return res.status(400).json({
        message: "Outlet ID is required",
      });
    }

    // ========================================
    // FIND ASSET
    // ========================================

    const asset = await Asset.findOne({
      ain: ain.trim(),
    });

    if (!asset) {
      return res.status(404).json({
        message: "Asset with this AIN was not found",
      });
    }

    // ========================================
    // DISPOSED
    // ========================================

    if (asset.status === "DISPOSED") {
      return res.status(400).json({
        message: "Disposed asset cannot be mapped",
      });
    }

    // ========================================
    // MUST HAVE OUTLET
    // ========================================

    if (!asset.currentOutlet) {
      return res.status(400).json({
        message: "This asset is not assigned to an outlet",
      });
    }

    // ========================================
    // FIND SELECTED OUTLET
    // ========================================

    const outlet = await Outlet.findById(outletId);

    if (!outlet) {
      return res.status(404).json({
        message: "Outlet not found",
      });
    }

    // ========================================
    // OUTLET MUST BE ACTIVE
    // ========================================

    if (outlet.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Selected outlet is inactive",
      });
    }

    // ========================================
    // MAPPING VALIDATION
    //
    // The selected outlet must be the
    // asset's currently assigned outlet.
    // ========================================

    if (asset.currentOutlet.toString() !== outletId.toString()) {
      return res.status(400).json({
        message: "Selected outlet does not match the asset's assigned outlet",
      });
    }

    // ========================================
    // PREVENT DUPLICATE PENDING REQUEST
    // ========================================

    const existingPending = await VerificationMapping.findOne({
      asset: asset._id,

      status: "PENDING",
    });

    if (existingPending) {
      return res.status(409).json({
        message:
          "A verification mapping request is already pending for this asset",
      });
    }

    // ========================================
    // PREVENT MAPPING ALREADY ACTIVATED
    // ========================================

    if (asset.isActivated) {
      return res.status(400).json({
        message: "This asset is already activated",
      });
    }

    // ========================================
    // CREATE MAPPING REQUEST
    // ========================================

    const assignedAso = await getRequesterAso(req.user.userId);

    const mapping = await VerificationMapping.create({
      asset: asset._id,

      outlet: outlet._id,

      submittedBy: req.user.userId,

      assignedAso,

      status: "PENDING",

      remarks: remarks?.trim() || null,
    });

    // ========================================
    // POPULATE
    // ========================================

    await mapping.populate([
      {
        path: "asset",
        select:
          "ain serialNumber capacity status isActivated verificationStatus",
      },
      {
        path: "outlet",
        select: "name code address contactPerson phone status",
      },
      {
        path: "submittedBy",
        select: "name email role",
      },
    ]);

    return res.status(201).json({
      message: "Verification mapping submitted successfully",

      mapping,
    });
  } catch (error) {
    console.error("Create Verification Mapping Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET PENDING MAPPINGS
// SYSTEM ADMIN
// ========================================

const getPendingMappings = async (req, res) => {
  try {
    const mappings = await VerificationMapping.find({
      status: "PENDING",
      ...(await asoRequestFilter(req)),
    })
      .populate(
        "asset",
        "ain serialNumber capacity status isActivated verificationStatus currentOutlet",
      )
      .populate("outlet", "name code type address contactPerson phone status")
      .populate("submittedBy", "name email role")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message: "Pending verification mappings fetched successfully",

      count: mappings.length,

      mappings,
    });
  } catch (error) {
    console.error("Get Pending Mappings Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// REVIEW MAPPING
// SYSTEM ADMIN
// ========================================

const reviewVerificationMapping = async (req, res) => {
  try {
    const { id } = req.params;

    const { decision, rejectionRemarks } = req.body;

    // ========================================
    // VALIDATE DECISION
    // ========================================

    if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
      return res.status(400).json({
        message: "Decision must be APPROVED or REJECTED",
      });
    }

    // ========================================
    // REJECTION REMARKS
    // ========================================

    if (decision === "REJECTED" && !rejectionRemarks?.trim()) {
      return res.status(400).json({
        message: "Rejection remarks are required",
      });
    }

    // ========================================
    // FIND MAPPING
    // ========================================

    const mapping = await VerificationMapping.findById(id);

    if (!mapping) {
      return res.status(404).json({
        message: "Verification mapping not found",
      });
    }

    if (!(await canReviewRequest(req, mapping))) {
      return res
        .status(403)
        .json({ message: "This request is assigned to a different ASO." });
    }

    // ========================================
    // MUST BE PENDING
    // ========================================

    if (mapping.status !== "PENDING") {
      return res.status(400).json({
        message: `Verification mapping is already ${mapping.status}`,
      });
    }

    // ========================================
    // FIND ASSET
    // ========================================

    const asset = await Asset.findById(mapping.asset);

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    // ========================================
    // APPROVE
    // ========================================

    if (decision === "APPROVED") {
      // ----------------------------------------
      // ASSET MUST STILL HAVE SAME OUTLET
      // ----------------------------------------

      if (
        !asset.currentOutlet ||
        asset.currentOutlet.toString() !== mapping.outlet.toString()
      ) {
        return res.status(400).json({
          message:
            "Asset's assigned outlet has changed. Please submit a new mapping request.",
        });
      }

      // ----------------------------------------
      // ACTIVATE ASSET
      // ----------------------------------------

      asset.isActivated = true;

      asset.activatedAt = new Date();

      asset.activatedBy = req.user.userId;

      // ----------------------------------------
      // VERIFICATION STATUS
      // ----------------------------------------

      asset.verificationStatus = "VERIFIED";

      asset.lastVerifiedAt = new Date();

      await asset.save();

      // ----------------------------------------
      // UPDATE MAPPING
      // ----------------------------------------

      mapping.status = "APPROVED";

      mapping.reviewedBy = req.user.userId;

      mapping.reviewedAt = new Date();

      mapping.rejectionRemarks = null;

      await mapping.save();

      await mapping.populate([
        {
          path: "asset",
          select:
            "ain serialNumber capacity status isActivated verificationStatus currentOutlet",
        },
        {
          path: "outlet",
          select: "name code address contactPerson phone",
        },
        {
          path: "submittedBy",
          select: "name email role",
        },
        {
          path: "reviewedBy",
          select: "name email role",
        },
      ]);

      return res.status(200).json({
        message:
          "Verification mapping approved and asset activated successfully",

        mapping,

        asset: {
          _id: asset._id,

          ain: asset.ain,

          serialNumber: asset.serialNumber,

          isActivated: asset.isActivated,

          verificationStatus: asset.verificationStatus,
        },
      });
    }

    // ========================================
    // REJECT
    // ========================================

    mapping.status = "REJECTED";

    mapping.reviewedBy = req.user.userId;

    mapping.reviewedAt = new Date();

    mapping.rejectionRemarks = rejectionRemarks.trim();

    await mapping.save();

    await mapping.populate([
      {
        path: "asset",
        select:
          "ain serialNumber capacity status isActivated verificationStatus currentOutlet",
      },
      {
        path: "outlet",
        select: "name code address contactPerson phone",
      },
      {
        path: "submittedBy",
        select: "name email role",
      },
      {
        path: "reviewedBy",
        select: "name email role",
      },
    ]);

    return res.status(200).json({
      message: "Verification mapping rejected successfully",

      mapping,
    });
  } catch (error) {
    console.error("Review Verification Mapping Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET MY REJECTED/PREVIOUS MAPPINGS
// ========================================

const getMyMappings = async (req, res) => {
  try {
    const mappings = await VerificationMapping.find({
      submittedBy: req.user.userId,
    })
      .populate(
        "asset",
        "ain serialNumber capacity status isActivated verificationStatus",
      )
      .populate("outlet", "name code")
      .populate("reviewedBy", "name email role")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message: "Your verification mappings fetched successfully",

      count: mappings.length,

      mappings,
    });
  } catch (error) {
    console.error("Get My Mappings Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET ALL VERIFICATION MAPPING HISTORY
// SYSTEM ADMIN
// ========================================

const getVerificationMappingHistory = async (req, res) => {
  try {
    const mappings = await VerificationMapping.find({
      status: {
        $in: ["APPROVED", "REJECTED"],
      },
    })
      .populate(
        "asset",
        "ain serialNumber capacity status isActivated verificationStatus currentOutlet",
      )
      .populate("outlet", "name code type address contactPerson phone status")
      .populate("submittedBy", "name email role")
      .populate("reviewedBy", "name email role")
      .sort({
        reviewedAt: -1,
      });

    return res.status(200).json({
      message: "Verification mapping history fetched successfully",

      count: mappings.length,

      mappings,
    });
  } catch (error) {
    console.error("Get Verification Mapping History Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET VERIFICATION HISTORY FOR ONE ASSET
// SYSTEM ADMIN + ASO
// ========================================

const getAssetVerificationHistory = async (req, res) => {
  try {
    const { assetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      return res.status(400).json({
        message: "Invalid asset ID",
      });
    }

    const mappings = await VerificationMapping.find({
      asset: assetId,
      status: {
        $in: ["APPROVED", "REJECTED"],
      },
    })
      .populate(
        "asset",
        "ain serialNumber capacity status isActivated verificationStatus currentOutlet",
      )
      .populate("outlet", "name code address contactPerson phone status")
      .populate("reviewedBy", "name email role")
      .sort({ reviewedAt: -1, createdAt: -1 });

    return res.status(200).json({
      message: "Asset verification history fetched successfully",
      count: mappings.length,
      history: mappings,
    });
  } catch (error) {
    console.error("Get Asset Verification History Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = {
  getAssetByAIN,
  createVerificationMapping,
  getPendingMappings,
  reviewVerificationMapping,
  getMyMappings,
  getVerificationMappingHistory,
  getAssetVerificationHistory,
};
