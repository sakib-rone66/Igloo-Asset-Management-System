const mongoose = require("mongoose");
const Region = require("../models/Region");

// CREATE REGION
const createRegion = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Region name and code are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedCode = code.toUpperCase().trim();

    const existingRegion = await Region.findOne({
      $or: [
        { name: normalizedName },
        { code: normalizedCode },
      ],
    });

    if (existingRegion) {
      return res.status(409).json({
        message: "Region name or code already exists",
      });
    }

    const region = await Region.create({
      name: normalizedName,
      code: normalizedCode,
    });

    return res.status(201).json({
      message: "Region created successfully",
      region,
    });
  } catch (error) {
    console.error("Create Region Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// GET ALL REGIONS
const getRegions = async (req, res) => {
  try {
    const regions = await Region.find().sort({
      name: 1,
    });

    return res.status(200).json({
      message: "Regions fetched successfully",
      count: regions.length,
      regions,
    });
  } catch (error) {
    console.error("Get Regions Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// GET REGION BY ID
const getRegionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid region ID",
      });
    }

    const region = await Region.findById(id);

    if (!region) {
      return res.status(404).json({
        message: "Region not found",
      });
    }

    return res.status(200).json({
      message: "Region fetched successfully",
      region,
    });
  } catch (error) {
    console.error("Get Region Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// UPDATE REGION
const updateRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid region ID",
      });
    }

    const region = await Region.findById(id);

    if (!region) {
      return res.status(404).json({
        message: "Region not found",
      });
    }

    if (name) {
      region.name = name.trim();
    }

    if (code) {
      region.code = code.toUpperCase().trim();
    }

    const duplicate = await Region.findOne({
      _id: { $ne: id },
      $or: [
        { name: region.name },
        { code: region.code },
      ],
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Region name or code already exists",
      });
    }

    await region.save();

    return res.status(200).json({
      message: "Region updated successfully",
      region,
    });
  } catch (error) {
    console.error("Update Region Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// UPDATE REGION STATUS
const updateRegionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid region ID",
      });
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        message: "Status must be ACTIVE or INACTIVE",
      });
    }

    const region = await Region.findById(id);

    if (!region) {
      return res.status(404).json({
        message: "Region not found",
      });
    }

    region.status = status;

    await region.save();

    return res.status(200).json({
      message: `Region status updated to ${status}`,
      region,
    });
  } catch (error) {
    console.error("Update Region Status Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = {
  createRegion,
  getRegions,
  getRegionById,
  updateRegion,
  updateRegionStatus,
};