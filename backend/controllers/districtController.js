const mongoose = require("mongoose");
const District = require("../models/District");
const Region = require("../models/Region");

// ========================================
// CREATE DISTRICT
// ========================================

const createDistrict = async (req, res) => {
  try {
    const { name, code, region } = req.body;

    // REQUIRED FIELDS
    if (!name || !code || !region) {
      return res.status(400).json({
        message: "Name, code and region are required",
      });
    }

    // VALIDATE REGION ID
    if (!mongoose.Types.ObjectId.isValid(region)) {
      return res.status(400).json({
        message: "Invalid region ID",
      });
    }

    // CHECK REGION
    const existingRegion = await Region.findById(region);

    if (!existingRegion) {
      return res.status(404).json({
        message: "Region not found",
      });
    }

    // REGION MUST BE ACTIVE
    if (existingRegion.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Cannot create district under an inactive region",
      });
    }

    // NORMALIZE DISTRICT DETAILS
    const normalizedName = name.trim();
    const normalizedCode = code.toUpperCase().trim();

    // CHECK DUPLICATE NAME OR CODE
    const existingDistrict = await District.findOne({
      $or: [{ name: normalizedName }, { code: normalizedCode }],
    });

    if (existingDistrict) {
      return res.status(409).json({
        message:
          existingDistrict.name === normalizedName
            ? "District name already exists"
            : "District code already exists",
      });
    }

    // CREATE DISTRICT
    const district = await District.create({
      name: normalizedName,
      code: normalizedCode,
      region,
    });

    // POPULATE REGION
    await district.populate("region", "name code status");

    return res.status(201).json({
      message: "District created successfully",
      district,
    });
  } catch (error) {
    console.error("Create District Error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: error.keyPattern?.name
          ? "District name already exists"
          : "District code already exists",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET ALL DISTRICTS
// ========================================

const getDistricts = async (req, res) => {
  try {
    const { region, status } = req.query;

    const filter = {};

    // FILTER BY REGION
    if (region) {
      if (!mongoose.Types.ObjectId.isValid(region)) {
        return res.status(400).json({
          message: "Invalid region ID",
        });
      }

      filter.region = region;
    }

    // FILTER BY STATUS
    if (status) {
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          message: "Status must be ACTIVE or INACTIVE",
        });
      }

      filter.status = status;
    }

    const districts = await District.find(filter)
      .populate("region", "name code status")
      .sort({ name: 1 });

    return res.status(200).json({
      message: "Districts fetched successfully",
      count: districts.length,
      districts,
    });
  } catch (error) {
    console.error("Get Districts Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET DISTRICT BY ID
// ========================================

const getDistrictById = async (req, res) => {
  try {
    const { id } = req.params;

    // VALIDATE ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid district ID",
      });
    }

    // FIND DISTRICT
    const district = await District.findById(id).populate(
      "region",
      "name code status",
    );

    if (!district) {
      return res.status(404).json({
        message: "District not found",
      });
    }

    return res.status(200).json({
      message: "District fetched successfully",
      district,
    });
  } catch (error) {
    console.error("Get District Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// UPDATE DISTRICT
// ========================================

const updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, code, region } = req.body;

    // VALIDATE DISTRICT ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid district ID",
      });
    }

    // FIND DISTRICT
    const district = await District.findById(id);

    if (!district) {
      return res.status(404).json({
        message: "District not found",
      });
    }

    // UPDATE NAME
    if (name) {
      const normalizedName = name.trim();

      const existingDistrict = await District.findOne({
        name: normalizedName,
        _id: { $ne: id },
      });

      if (existingDistrict) {
        return res.status(409).json({
          message: "District name already exists",
        });
      }

      district.name = normalizedName;
    }

    // UPDATE CODE
    if (code) {
      const normalizedCode = code.toUpperCase().trim();

      const existingDistrict = await District.findOne({
        code: normalizedCode,
        _id: { $ne: id },
      });

      if (existingDistrict) {
        return res.status(409).json({
          message: "District code already exists",
        });
      }

      district.code = normalizedCode;
    }

    // UPDATE REGION
    if (region) {
      // VALIDATE REGION ID
      if (!mongoose.Types.ObjectId.isValid(region)) {
        return res.status(400).json({
          message: "Invalid region ID",
        });
      }

      // FIND REGION
      const existingRegion = await Region.findById(region);

      if (!existingRegion) {
        return res.status(404).json({
          message: "Region not found",
        });
      }

      // REGION MUST BE ACTIVE
      if (existingRegion.status !== "ACTIVE") {
        return res.status(400).json({
          message: "Cannot assign district to an inactive region",
        });
      }

      district.region = region;
    }

    // SAVE
    await district.save();

    // POPULATE
    await district.populate("region", "name code status");

    return res.status(200).json({
      message: "District updated successfully",
      district,
    });
  } catch (error) {
    console.error("Update District Error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: error.keyPattern?.name
          ? "District name already exists"
          : "District code already exists",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// UPDATE DISTRICT STATUS
// ========================================

const updateDistrictStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ========================================
    // VALIDATE DISTRICT ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid district ID",
      });
    }

    // ========================================
    // VALIDATE STATUS
    // ========================================

    if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        message: "Status must be ACTIVE or INACTIVE",
      });
    }

    // ========================================
    // FIND DISTRICT
    // ========================================

    const district = await District.findById(id);

    if (!district) {
      return res.status(404).json({
        message: "District not found",
      });
    }

    // ========================================
    // ACTIVATING DISTRICT
    // ========================================

    if (status === "ACTIVE") {
      const region = await Region.findById(district.region);

      if (!region) {
        return res.status(404).json({
          message: "Region not found",
        });
      }

      // ========================================
      // REGION MUST BE ACTIVE
      // ========================================

      if (region.status !== "ACTIVE") {
        return res.status(400).json({
          message:
            "Cannot activate district under an inactive region",
        });
      }
    }

    // ========================================
    // UPDATE STATUS
    // ========================================

    district.status = status;

    await district.save();

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: `District status updated to ${status}`,
      district: {
        id: district._id,
        name: district.name,
        code: district.code,
        region: district.region,
        status: district.status,
      },
    });
  } catch (error) {
    console.error("Update District Status Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  createDistrict,
  getDistricts,
  getDistrictById,
  updateDistrict,
  updateDistrictStatus,
};
