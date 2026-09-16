const mongoose = require("mongoose");

const AssetRequest = require("../models/AssetRequest");
const Outlet = require("../models/Outlet");
const User = require("../models/User");
const {
  getRequesterAso,
  canReviewRequest,
  asoRequestFilter,
} = require("../utils/asoApproval");

// ========================================
// HELPER
// BUILD REQUEST FILTER
// ========================================

const buildRequestFilter = async (req) => {
  const { search = "", status = "", fromDate = "", toDate = "" } = req.query;

  const filter = {};

  // ========================================
  // STATUS
  // ========================================

  if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    filter.status = status;
  }

  // ========================================
  // DATE FILTER
  // ========================================

  if (fromDate || toDate) {
    filter.createdAt = {};

    if (fromDate) {
      const startDate = new Date(`${fromDate}T00:00:00.000`);

      if (!Number.isNaN(startDate.getTime())) {
        filter.createdAt.$gte = startDate;
      }
    }

    if (toDate) {
      const endDate = new Date(`${toDate}T23:59:59.999`);

      if (!Number.isNaN(endDate.getTime())) {
        filter.createdAt.$lte = endDate;
      }
    }

    if (Object.keys(filter.createdAt).length === 0) {
      delete filter.createdAt;
    }
  }

  // ========================================
  // SEARCH
  // ========================================

  if (search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");

    const [outlets, users] = await Promise.all([
      Outlet.find({
        $or: [{ name: searchRegex }, { outletCode: searchRegex }],
      }).select("_id"),

      User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select("_id"),
    ]);

    const outletIds = outlets.map((outlet) => outlet._id);
    const userIds = users.map((user) => user._id);

    filter.$or = [
      {
        reason: searchRegex,
      },
      {
        remarks: searchRegex,
      },
      {
        outlet: {
          $in: outletIds,
        },
      },
      {
        requestedBy: {
          $in: userIds,
        },
      },
    ];
  }

  return filter;
};

// ========================================
// CHECK ADMIN
// ========================================

const ensureRequestManager = (req, res) => {
  if (!req.user || !["SYSTEM_ADMIN", "TSM", "TSO"].includes(req.user.role)) {
    res.status(403).json({
      message: "Only the assigned TSO can manage asset requests.",
    });

    return false;
  }

  return true;
};

// ========================================
// CREATE ASSET REQUEST
// USER
// ========================================

const createAssetRequest = async (req, res) => {
  try {
    const { outletId, quantity, reason, remarks } = req.body;

    // ========================================
    // OUTLET
    // ========================================

    if (!outletId) {
      return res.status(400).json({
        message: "Outlet is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(outletId)) {
      return res.status(400).json({
        message: "Invalid outlet ID.",
      });
    }

    // ========================================
    // QUANTITY
    // ========================================

    if (quantity === undefined || quantity === null || quantity === "") {
      return res.status(400).json({
        message: "Quantity is required.",
      });
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive integer.",
      });
    }

    // ========================================
    // REASON
    // ========================================

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Reason is required.",
      });
    }

    // ========================================
    // FIND OUTLET
    // ========================================

    const outlet = await Outlet.findById(outletId);

    if (!outlet) {
      return res.status(404).json({
        message: "Outlet not found.",
      });
    }

    // ========================================
    // ACTIVE OUTLET ONLY
    // ========================================

    if (outlet.status !== "ACTIVE") {
      return res.status(400).json({
        message: "This outlet is currently inactive.",
      });
    }

    // ========================================
    // CREATE REQUEST
    // ========================================

    const assignedAso = await getRequesterAso(req.user.userId);

    const assetRequest = await AssetRequest.create({
      outlet: outlet._id,
      requestedBy: req.user.userId,
      assignedAso,
      quantity: Number(quantity),
      reason: reason.trim(),
      remarks: remarks && remarks.trim() ? remarks.trim() : null,
      status: "PENDING",
    });

    // ========================================
    // POPULATE RESPONSE
    // ========================================

    const populatedRequest = await AssetRequest.findById(assetRequest._id)
      .populate("outlet", "name outletCode")
      .populate("requestedBy", "name email role");

    return res.status(201).json({
      message: "Asset request created successfully.",
      assetRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Create Asset Request Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// ========================================
// GET MY ASSET REQUESTS
// USER
// ========================================

const getMyAssetRequests = async (req, res) => {
  try {
    const filter = await buildRequestFilter(req);

    // IMPORTANT:
    // User can ONLY see their own requests.
    filter.requestedBy = req.user.userId;

    const assetRequests = await AssetRequest.find(filter)
      .populate("outlet", "name outletCode")
      .populate("requestedBy", "name email role")
      .populate("reviewedBy", "name email role")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message: "Your asset requests fetched successfully.",
      count: assetRequests.length,
      assetRequests,
    });
  } catch (error) {
    console.error("Get My Asset Requests Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// ========================================
// GET PENDING ASSET REQUESTS
// ADMIN
// ========================================

const getPendingAssetRequests = async (req, res) => {
  try {
    if (!ensureRequestManager(req, res)) {
      return;
    }

    const assetRequests = await AssetRequest.find({
      status: "PENDING",
      ...(await asoRequestFilter(req)),
    })
      .populate("outlet", "name outletCode")
      .populate("requestedBy", "name email role")
      .populate("reviewedBy", "name email role")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message: "Pending asset requests fetched successfully.",
      count: assetRequests.length,
      assetRequests,
    });
  } catch (error) {
    console.error("Get Pending Asset Requests Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL ASSET REQUESTS
// ADMIN
// SEARCH + STATUS + DATE
// ========================================

const getAllAssetRequests = async (req, res) => {
  try {
    if (!ensureRequestManager(req, res)) {
      return;
    }

    const filter = {
      ...(await buildRequestFilter(req)),
      ...(await asoRequestFilter(req)),
    };

    const assetRequests = await AssetRequest.find(filter)
      .populate("outlet", "name outletCode")
      .populate("requestedBy", "name email role")
      .populate("reviewedBy", "name email role")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message: "All asset requests fetched successfully.",
      count: assetRequests.length,
      assetRequests,
    });
  } catch (error) {
    console.error("Get All Asset Requests Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// ========================================
// APPROVE / REJECT
// ADMIN
// ========================================

const updateAssetRequestStatus = async (req, res) => {
  try {
    // ========================================
    // ADMIN CHECK
    // ========================================

    if (!ensureRequestManager(req, res)) {
      return;
    }

    const { id } = req.params;
    const { status, remarks } = req.body;

    // ========================================
    // ID VALIDATION
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid asset request ID.",
      });
    }

    // ========================================
    // STATUS VALIDATION
    // ========================================

    if (!status) {
      return res.status(400).json({
        message: "Status is required.",
      });
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be APPROVED or REJECTED.",
      });
    }

    // ========================================
    // REJECTION REMARKS
    // ========================================

    if (status === "REJECTED" && (!remarks || !remarks.trim())) {
      return res.status(400).json({
        message: "Rejection remarks are required.",
      });
    }

    // ========================================
    // FIND REQUEST
    // ========================================

    const assetRequest = await AssetRequest.findById(id);

    if (!assetRequest) {
      return res.status(404).json({
        message: "Asset request not found.",
      });
    }

    if (!(await canReviewRequest(req, assetRequest))) {
      return res
        .status(403)
        .json({ message: "This request is assigned to a different ASO." });
    }

    // ========================================
    // MUST BE PENDING
    // ========================================

    if (assetRequest.status !== "PENDING") {
      return res.status(400).json({
        message: `Asset request is already ${assetRequest.status}.`,
      });
    }

    // ========================================
    // UPDATE
    // ========================================

    assetRequest.status = status;

    assetRequest.reviewedBy = req.user.userId;

    assetRequest.reviewedAt = new Date();

    if (remarks !== undefined) {
      assetRequest.remarks = remarks && remarks.trim() ? remarks.trim() : null;
    }

    await assetRequest.save();

    // ========================================
    // POPULATE
    // ========================================

    const populatedRequest = await AssetRequest.findById(id)
      .populate("outlet", "name outletCode")
      .populate("requestedBy", "name email role")
      .populate("reviewedBy", "name email role");

    return res.status(200).json({
      message:
        status === "APPROVED"
          ? "Asset request approved successfully."
          : "Asset request rejected successfully.",
      assetRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Update Asset Request Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  createAssetRequest,
  getMyAssetRequests,
  getPendingAssetRequests,
  getAllAssetRequests,
  updateAssetRequestStatus,
};
