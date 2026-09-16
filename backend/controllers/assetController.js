//Import /models/Asset.js
const Asset = require("../models/Asset");
const Outlet = require("../models/Outlet");
const AssetHistory = require("../models/AssetHistory");
const QRCode = require("qrcode");

// GET ALL ASSETS
// GET ALL ASSETS
const getAssets = async (req, res) => {
  try {
    // Get filters from query parameters
    const {
      status,
      manufacturer,
      ain,
      serialNumber,
      outlet,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = req.query;

    // Create filter
    const filter = {};

    // ========================================
    // STATUS FILTER
    // ========================================

    if (status) {
      filter.status = status;
    }

    // ========================================
    // MANUFACTURER FILTER
    // ========================================

    if (manufacturer) {
      filter.manufacturer = manufacturer;
    }

    // ========================================
    // AIN FILTER
    // ========================================

    if (ain) {
      filter.ain = {
        $regex: ain,
        $options: "i",
      };
    }

    // ========================================
    // SERIAL NUMBER FILTER
    // ========================================

    if (serialNumber) {
      filter.serialNumber = serialNumber;
    }

    // ========================================
    // OUTLET FILTER
    // ========================================

    /*
      If an outlet ID is provided:

      GET /api/assets?outlet=OUTLET_ID

      MongoDB will return only assets whose
      currentOutlet matches that outlet.
    */

    if (outlet) {
      filter.currentOutlet = outlet;
    }

    // ========================================
    // PAGINATION
    // ========================================

    // Convert page and limit to numbers
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // Calculate how many documents to skip
    const skip = (pageNumber - 1) * limitNumber;

    // ========================================
    // COUNT ASSETS
    // ========================================

    // Count total assets matching filters
    const totalAssets = await Asset.countDocuments(filter);

    // ========================================
    // SORT ASSETS
    // ========================================

    const sortOptions = {};

    if (sortBy === "createdAt") {
      sortOptions.createdAt = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "manufacturer") {
      sortOptions.ain = 1;
    } else {
      sortOptions.createdAt = -1;
    }

    // ========================================
    // FIND ASSETS
    // ========================================

    const assets = await Asset.find(filter)
      // Manufacturer information
      .populate("manufacturer", "name code")

      // Current outlet information
      .populate("currentOutlet", "name outletCode")

      // Sort by selected field
      .sort(sortOptions)

      // Pagination
      .skip(skip)
      .limit(limitNumber);

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: "Assets fetched successfully",

      // Number of assets in current page
      count: assets.length,

      // Total matching assets
      totalAssets,

      // Current page
      currentPage: pageNumber,

      // Total pages
      totalPages: Math.ceil(totalAssets / limitNumber),

      // Returned assets
      assets,
    });
  } catch (error) {
    console.error("Get Assets Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// GET BY ID
const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findById(id)
      .populate("manufacturer", "name code")
      .populate("currentOutlet", "name outletCode")
      .populate("authorization", "status decisionDate");

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      message: "Asset fetched successfully",
      asset,
    });
  } catch (error) {
    console.error("Get Asset Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// GET BY AIN
const getAssetByAIN = async (req, res) => {
  try {
    const asset = await Asset.findOne({ ain: req.params.ain })
      .populate("manufacturer", "name code")
      .populate("currentOutlet", "name code")
      .populate("authorization", "status decisionDate");

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      message: "Asset fetched successfully",
      asset,
    });
  } catch (error) {
    console.error("Get Asset By AIN Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ASSIGN ASSET TO OUTLET
const assignAssetToOutlet = async (req, res) => {
  try {
    const { id } = req.params;

    const { outletId, remarks } = req.body;
    // CHECK OUTLET ID
    if (!outletId) {
      return res.status(400).json({
        message: "Outlet ID is required",
      });
    }
    // FIND ASSET
    const asset = await Asset.findById(id);

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    // ASSET MUST BE IN STOCK
    if (asset.status !== "IN_STOCK") {
      return res.status(400).json({
        message: `Asset cannot be assigned because its current status is ${asset.status}`,
      });
    }

    // FIND OUTLET
    const outlet = await Outlet.findById(outletId);

    if (!outlet) {
      return res.status(404).json({
        message: "Outlet not found",
      });
    }

    // CHECK OUTLET STATUS
    if (outlet.status !== "ACTIVE") {
      return res.status(400).json({
        message: "This outlet is currently inactive",
      });
    }

    // UPDATE ASSET
    asset.currentOutlet = outlet._id;
    asset.status = "ASSIGNED";

    await asset.save();

    // CREATE ASSET HISTORY
    const history = await AssetHistory.create({
      asset: asset._id,
      // Asset was previously in warehouse
      fromOutlet: null,
      // New outlet
      toOutlet: outlet._id,
      action: "ASSIGNED",

      // Logged-in user
      performedBy: req.user.userId,
      remarks: remarks || null,
    });

    return res.status(200).json({
      message: "Asset assigned to outlet successfully",
      asset,
      history,
    });
  } catch (error) {
    console.error("Assign Asset Error:", error.message);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// TRANSFER ASSET TO ANOTHER OUTLET
const transferAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { outletId, remarks } = req.body;

    // CHECK OUTLET ID
    if (!outletId) {
      return res.status(400).json({
        message: "New outlet ID is required",
      });
    }
    // FIND ASSET
    const asset = await Asset.findById(id);

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }
    // ASSET MUST BE ASSIGNED
    if (asset.status !== "ASSIGNED") {
      return res.status(400).json({
        message: `Asset cannot be transferred because its current status is ${asset.status}`,
      });
    }

    // CHECK CURRENT OUTLET
    if (!asset.currentOutlet) {
      return res.status(400).json({
        message: "Assigned asset has no current outlet",
      });
    }
    // SAVE CURRENT OUTLET BEFORE CHANGING IT
    const fromOutlet = asset.currentOutlet;
    // PREVENT TRANSFER TO SAME OUTLET
    if (fromOutlet.toString() === outletId) {
      return res.status(400).json({
        message: "Asset is already assigned to this outlet",
      });
    }
    // FIND NEW OUTLET
    const outlet = await Outlet.findById(outletId);
    if (!outlet) {
      return res.status(404).json({
        message: "New outlet not found",
      });
    }
    // CHECK NEW OUTLET STATUS
    if (outlet.status !== "ACTIVE") {
      return res.status(400).json({
        message: "New outlet is currently inactive",
      });
    }
    // UPDATE ASSET
    asset.currentOutlet = outlet._id;
    asset.isActivated = false;

    // A transfer requires verification at the new outlet.
    if (asset.verificationStatus === "VERIFIED") {
      asset.verificationStatus = "NOT_VERIFIED";
      asset.lastVerifiedAt = null;
    }

    // STATUS REMAINS ASSIGNED
    asset.status = "ASSIGNED";
    await asset.save();

    // CREATE HISTORY
    const history = await AssetHistory.create({
      asset: asset._id,
      fromOutlet: fromOutlet,
      toOutlet: outlet._id,
      action: "TRANSFERRED",
      performedBy: req.user.userId,
      remarks: remarks || null,
    });

    return res.status(200).json({
      message: "Asset transferred successfully",
      asset,
      history,
    });
  } catch (error) {
    console.error("Transfer Asset Error:", error.message);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// RETURN ASSET TO WAREHOUSE
const returnAssetToWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    // FIND ASSET
    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }
    // ASSET MUST BE ASSIGNED TO AN OUTLET
    if (asset.status !== "ASSIGNED" || !asset.currentOutlet) {
      return res.status(400).json({
        message: "Asset is not currently assigned to an outlet",
      });
    }

    // SAVE CURRENT OUTLET BEFORE REMOVING IT
    const fromOutlet = asset.currentOutlet;

    // UPDATE ASSET
    asset.currentOutlet = null;
    asset.status = "IN_STOCK";
    asset.isActivated = false;
    asset.activatedAt = null;
    asset.activatedBy = null;
    await asset.save();

    // CREATE HISTORY
    const history = await AssetHistory.create({
      asset: asset._id,
      fromOutlet: fromOutlet,
      toOutlet: null,
      action: "RETURNED",
      performedBy: req.user.userId,
      remarks: remarks || null,
    });
    return res.status(200).json({
      message: "Asset returned to warehouse successfully",
      asset,
      history,
    });
  } catch (error) {
    console.error("Return Asset Error:", error.message);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// GENERATE ASSET QR CODE
// ========================================

const generateAssetQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    // FIND ASSET
    const asset = await Asset.findById(id);

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    // ========================================
    // QR URL
    //
    // QR contains the asset ID in a URL.
    // When scanned, frontend opens the
    // public asset scan page.
    // ========================================

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const qrUrl = `${frontendUrl}/scan/asset/${asset._id}`;

    // ========================================
    // GENERATE QR
    // ========================================

    const qrCode = await QRCode.toDataURL(qrUrl);

    return res.status(200).json({
      message: "Asset QR code generated successfully",

      asset: {
        _id: asset._id,
        ain: asset.ain,
        serialNumber: asset.serialNumber,
      },

      qrCode,

      qrUrl,
    });
  } catch (error) {
    console.error("Generate Asset QR Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// PUBLIC ASSET INFORMATION BY QR
// ========================================

const getPublicAssetByQR = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================
    // FIND ASSET
    //
    // currentOutlet is populated so we can
    // return current outlet information.
    // ========================================

    const asset = await Asset.findById(id)
      .populate("currentOutlet", "name code contactPerson phone status")
      .populate("manufacturer", "name");

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    // ========================================
    // RETURN ONLY INFORMATION THAT SHOULD
    // BE VISIBLE WHEN QR IS SCANNED
    // ========================================

    return res.status(200).json({
      message: "Asset information fetched successfully",

      asset: {
        id: asset._id,
        ain: asset.ain,
        serialNumber: asset.serialNumber,
        capacity: asset.capacity,
        manufacturer: asset.manufacturer?.name || "N/A",
        verificationStatus: asset.verificationStatus || "NOT_VERIFIED",
        activationStatus: asset.isActivated ? "ACTIVATED" : "NOT ACTIVATED",

        currentOutlet: asset.currentOutlet
          ? {
              name: asset.currentOutlet.name,
              code: asset.currentOutlet.code || "N/A",
              contactPerson: asset.currentOutlet.contactPerson || "N/A",
              phone: asset.currentOutlet.phone || "N/A",
              status: asset.currentOutlet.status,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get Public Asset QR Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ACTIVATE ASSET
const activateAsset = async (req, res) => {
  try {
    const { id } = req.params;

    // Find asset
    const asset = await Asset.findById(id);

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    // Already activated
    if (asset.isActivated) {
      return res.status(400).json({
        message: "Asset is already activated",
      });
    }

    // Asset must be authorized
    if (!asset.authorization) {
      return res.status(400).json({
        message: "Asset must have authorization before activation",
      });
    }

    // Activate asset
    asset.isActivated = true;
    asset.activatedAt = new Date();
    asset.activatedBy = req.user.userId;

    await asset.save();

    return res.status(200).json({
      message: "Asset activated successfully",
      asset,
    });
  } catch (error) {
    console.error("Activate Asset Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// CREATE ASSET
const createAsset = async (req, res) => {
  try {
    // Get asset information from client
    const {
      ain,
      serialNumber,
      capacity,
      manufacturingMonth,
      manufacturingYear,
      manufacturer,
      authorization,
    } = req.body;

    // CHECK REQUIRED FIELDS
    if (
      !ain ||
      !serialNumber ||
      !capacity ||
      !manufacturingMonth ||
      !manufacturingYear ||
      !manufacturer ||
      !authorization
    ) {
      return res.status(400).json({
        message:
          "AIN, serial number, capacity, manufacturing month, manufacturing year, manufacturer and authorization are required",
      });
    }

    // CHECK IF AIN ALREADY EXISTS
    const existingAIN = await Asset.findOne({
      ain: ain.trim(),
    });

    if (existingAIN) {
      return res.status(409).json({
        message: "Asset with this AIN already exists",
      });
    }

    // CHECK IF SERIAL NUMBER ALREADY EXISTS
    const existingSerialNumber = await Asset.findOne({
      serialNumber: serialNumber.trim(),
    });

    if (existingSerialNumber) {
      return res.status(409).json({
        message: "Asset with this serial number already exists",
      });
    }

    // CREATE ASSET
    const asset = await Asset.create({
      ain: ain.trim(),
      serialNumber: serialNumber.trim(),
      capacity: Number(capacity),
      manufacturingMonth: Number(manufacturingMonth),
      manufacturingYear: Number(manufacturingYear),
      manufacturer,
      authorization,

      // New asset starts in warehouse
      currentOutlet: null,

      // New asset is not activated yet
      isActivated: false,

      // New asset starts as IN_STOCK
      status: "IN_STOCK",
    });

    return res.status(201).json({
      message: "Asset created successfully",
      asset,
    });
  } catch (error) {
    console.error("Create Asset Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

module.exports = {
  createAsset,
  getAssets,
  getAssetById,
  getAssetByAIN,
  assignAssetToOutlet,
  transferAsset,
  returnAssetToWarehouse,
  generateAssetQRCode,
  getPublicAssetByQR,
  activateAsset,
};
