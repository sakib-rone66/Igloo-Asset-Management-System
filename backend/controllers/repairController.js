const Repair = require("../models/Repair");
const Asset = require("../models/Asset");
const {
  getRequesterAso,
  canReviewRequest,
  asoRequestFilter,
} = require("../utils/asoApproval");

// ========================================
// CREATE REPAIR REQUEST
// ========================================

const createRepair = async (req, res) => {
  try {
    const { assetId, ain, problem, serviceProvider, remarks, repairCost } =
      req.body;

    // REQUIRED FIELDS
    if ((!assetId && !ain) || !problem || !remarks) {
      return res.status(400).json({
        message: "AIN, problem and remarks are required",
      });
    }

    // FIND ASSET
    const asset = await (
      ain ? Asset.findOne({ ain: ain.trim() }) : Asset.findById(assetId)
    ).populate("currentOutlet", "name code");

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    // ASSET MUST BE ASSIGNED
    if (asset.status !== "ASSIGNED") {
      return res.status(400).json({
        message: `Repair request cannot be created because asset status is ${asset.status}`,
      });
    }

    // CHECK EXISTING ACTIVE REPAIR
    const existingRepair = await Repair.findOne({
      asset: asset._id,
      status: {
        $in: ["PENDING", "UNDER_REPAIR"],
      },
    });

    if (existingRepair) {
      return res.status(400).json({
        message: "This asset already has a pending or active repair request",
      });
    }

    // VALIDATE COST
    if (
      repairCost !== undefined &&
      repairCost !== "" &&
      Number(repairCost) < 0
    ) {
      return res.status(400).json({
        message: "Repair cost cannot be negative",
      });
    }

    // CREATE REPAIR REQUEST
    const assignedAso = await getRequesterAso(req.user.userId);

    const repair = await Repair.create({
      asset: asset._id,
      reportedBy: req.user.userId,
      assignedAso,
      problem: problem.trim(),
      serviceProvider: serviceProvider ? serviceProvider.trim() : "",
      remarks: remarks.trim(),
      repairCost:
        repairCost === "" || repairCost === undefined ? 0 : Number(repairCost),
      status: "PENDING",
    });

    const populatedRepair = await Repair.findById(repair._id)
      .populate("asset")
      .populate("reportedBy", "name email");

    return res.status(201).json({
      message: "Repair request submitted successfully",
      repair: populatedRepair,
    });
  } catch (error) {
    console.error("Create Repair Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// GET MY REPAIR REQUESTS
// ========================================

const getMyRepairs = async (req, res) => {
  try {
    const repairs = await Repair.find({
      reportedBy: req.user.userId,
    })
      .populate({
        path: "asset",
        populate: {
          path: "currentOutlet",
          select: "name code",
        },
      })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Repair requests fetched successfully",
      count: repairs.length,
      repairs,
    });
  } catch (error) {
    console.error("Get My Repairs Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// GET PENDING REPAIR REQUESTS
// ADMIN
// ========================================

const getPendingRepairs = async (req, res) => {
  try {
    const repairs = await Repair.find({
      status: "PENDING",
      ...(await asoRequestFilter(req)),
    })
      .populate({
        path: "asset",
        populate: {
          path: "currentOutlet",
          select: "name code",
        },
      })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Pending repair requests fetched successfully",
      count: repairs.length,
      repairs,
    });
  } catch (error) {
    console.error("Get Pending Repairs Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// APPROVE REPAIR REQUEST
// ADMIN
// ========================================

const approveRepair = async (req, res) => {
  try {
    const { id } = req.params;

    const repair = await Repair.findById(id);

    if (!repair) {
      return res.status(404).json({
        message: "Repair request not found",
      });
    }

    if (!(await canReviewRequest(req, repair))) {
      return res
        .status(403)
        .json({ message: "This request is assigned to a different ASO." });
    }

    if (repair.status !== "PENDING") {
      return res.status(400).json({
        message: `Repair request cannot be approved because its status is ${repair.status}`,
      });
    }

    const asset = await Asset.findById(repair.asset);

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    // APPROVE
    repair.status = "UNDER_REPAIR";

    // UPDATE ASSET
    asset.status = "UNDER_REPAIR";

    await asset.save();
    await repair.save();

    const updatedRepair = await Repair.findById(repair._id)
      .populate("asset")
      .populate("reportedBy", "name email");

    return res.status(200).json({
      message: "Repair request approved successfully",
      repair: updatedRepair,
      asset,
    });
  } catch (error) {
    console.error("Approve Repair Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// REJECT REPAIR REQUEST
// ADMIN
// ========================================

const rejectRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const repair = await Repair.findById(id);

    if (!repair) {
      return res.status(404).json({
        message: "Repair request not found",
      });
    }

    if (!(await canReviewRequest(req, repair))) {
      return res
        .status(403)
        .json({ message: "This request is assigned to a different ASO." });
    }

    if (repair.status !== "PENDING") {
      return res.status(400).json({
        message: `Repair request cannot be rejected because its status is ${repair.status}`,
      });
    }

    repair.status = "REJECTED";
    repair.rejectedDate = new Date();

    if (rejectionReason !== undefined) {
      repair.rejectionReason = rejectionReason.trim();
    }

    await repair.save();

    const updatedRepair = await Repair.findById(repair._id)
      .populate("asset")
      .populate("reportedBy", "name email");

    return res.status(200).json({
      message: "Repair request rejected successfully",
      repair: updatedRepair,
    });
  } catch (error) {
    console.error("Reject Repair Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE REPAIR STATUS
// TECHNICIAN / ADMIN
// ========================================

const updateRepairStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status, repairCost, remarks } = req.body;

    if (!status || !["UNDER_REPAIR", "COMPLETED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be UNDER_REPAIR or COMPLETED",
      });
    }

    const repair = await Repair.findById(id);

    if (!repair) {
      return res.status(404).json({
        message: "Repair record not found",
      });
    }

    if (repair.status === "REJECTED") {
      return res.status(400).json({
        message: "Rejected repair cannot be updated",
      });
    }

    if (repair.status === "COMPLETED") {
      return res.status(400).json({
        message: "Repair is already completed",
      });
    }

    const asset = await Asset.findById(repair.asset);

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    repair.status = status;

    if (remarks !== undefined) {
      repair.remarks = remarks.trim();
    }

    if (repairCost !== undefined && repairCost !== "") {
      if (Number(repairCost) < 0) {
        return res.status(400).json({
          message: "Repair cost cannot be negative",
        });
      }

      repair.repairCost = Number(repairCost);
    }

    if (status === "UNDER_REPAIR") {
      asset.status = "UNDER_REPAIR";
    }

    if (status === "COMPLETED") {
      repair.completedDate = new Date();

      asset.status = "ASSIGNED";
    }

    await asset.save();
    await repair.save();

    const updatedRepair = await Repair.findById(repair._id)
      .populate("asset")
      .populate("reportedBy", "name email");

    return res.status(200).json({
      message: `Repair ${status === "COMPLETED" ? "completed" : "updated"} successfully`,
      repair: updatedRepair,
      asset,
    });
  } catch (error) {
    console.error("Update Repair Status Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// GET REPAIR HISTORY FOR ASSET
// ========================================

const getRepairHistory = async (req, res) => {
  try {
    const { assetId } = req.params;

    const asset = await Asset.findById(assetId);

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    const repairs = await Repair.find({
      asset: assetId,
    })
      .populate("reportedBy", "name email")
      .populate({
        path: "asset",
        populate: {
          path: "currentOutlet",
          select: "name code",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Repair history fetched successfully",
      count: repairs.length,
      repairs,
    });
  } catch (error) {
    console.error("Get Repair History Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// GET ASSET BY AIN FOR REPAIR REQUESTS
const getRepairAssetByAIN = async (req, res) => {
  try {
    const asset = await Asset.findOne({ ain: req.params.ain })
      .populate("manufacturer", "name code")
      .populate("currentOutlet", "name code");

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    return res.status(200).json({
      message: "Asset fetched successfully",
      asset,
    });
  } catch (error) {
    console.error("Get Repair Asset By AIN Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL REPAIR HISTORY
// ADMIN
// ========================================

const getUnderRepairAssets = async (req, res) => {
  try {
    const repairs = await Repair.find()
      .populate({
        path: "asset",
        populate: {
          path: "currentOutlet",
          select: "name code",
        },
      })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Repair history fetched successfully",
      count: repairs.length,
      repairs,
    });
  } catch (error) {
    console.error("Get Under Repair Assets Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  createRepair,
  getMyRepairs,
  getPendingRepairs,
  approveRepair,
  rejectRepair,
  updateRepairStatus,
  getRepairHistory,
  getRepairAssetByAIN,
  getUnderRepairAssets,
};
