const mongoose = require("mongoose");

const Distributor = require("../models/Distributor");
const District = require("../models/District");
const Outlet = require("../models/Outlet");

// ========================================
// CREATE DISTRIBUTOR
// ========================================

const createDistributor = async (req, res) => {
  try {
    const { name, code, district, address, contactPerson, phone } = req.body;

    // ========================================
    // REQUIRED FIELDS
    // ========================================

    if (!name || !code || !district || !address) {
      return res.status(400).json({
        message: "Name, code, district and address are required",
      });
    }

    // ========================================
    // VALIDATE DISTRICT ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(district)) {
      return res.status(400).json({
        message: "Invalid district ID",
      });
    }

    // ========================================
    // CHECK DISTRICT
    // ========================================

    const existingDistrict = await District.findById(district);

    if (!existingDistrict) {
      return res.status(404).json({
        message: "District not found",
      });
    }

    // ========================================
    // DISTRICT MUST BE ACTIVE
    // ========================================

    if (existingDistrict.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Cannot create distributor under an inactive district",
      });
    }

    // ========================================
    // NORMALIZE CODE
    // ========================================

    const normalizedCode = code.toUpperCase().trim();

    // ========================================
    // CHECK DUPLICATE CODE
    // ========================================

    const existingDistributor = await Distributor.findOne({
      code: normalizedCode,
    });

    if (existingDistributor) {
      return res.status(409).json({
        message: "Distributor code already exists",
      });
    }

    // ========================================
    // CREATE DISTRIBUTOR
    // ========================================

    const distributor = await Distributor.create({
      name: name.trim(),
      code: normalizedCode,
      district,
      address: address.trim(),
      contactPerson: contactPerson?.trim(),
      phone: phone?.trim(),
    });

    // ========================================
    // POPULATE DISTRICT
    // ========================================

    await distributor.populate({
      path: "district",
      select: "name code status region",
      populate: {
        path: "region",
        select: "name code status",
      },
    });

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({
      message: "Distributor created successfully",
      distributor,
    });
  } catch (error) {
    console.error("Create Distributor Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET ALL DISTRIBUTORS
// ========================================

const getDistributors = async (req, res) => {
  try {
    const { district, region, status } = req.query;

    const filter = {};

    // ========================================
    // FILTER BY DISTRICT
    // ========================================

    if (district) {
      if (!mongoose.Types.ObjectId.isValid(district)) {
        return res.status(400).json({
          message: "Invalid district ID",
        });
      }

      filter.district = district;
    }

    // ========================================
    // FILTER BY REGION
    // ========================================

    if (region) {
      if (!mongoose.Types.ObjectId.isValid(region)) {
        return res.status(400).json({
          message: "Invalid region ID",
        });
      }

      const regionDistricts = await District.find({ region }).select("_id");

      filter.district = {
        $in: regionDistricts.map((item) => item._id),
      };
    }

    // ========================================
    // FILTER BY STATUS
    // ========================================

    if (status) {
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          message: "Status must be ACTIVE or INACTIVE",
        });
      }

      filter.status = status;
    }

    // ========================================
    // GET DISTRIBUTORS
    // ========================================

    const distributors = await Distributor.find(filter)
      .populate({
        path: "district",
        select: "name code status region",
        populate: {
          path: "region",
          select: "name code status",
        },
      })
      .sort({ name: 1 });

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: "Distributors fetched successfully",
      count: distributors.length,
      distributors,
    });
  } catch (error) {
    console.error("Get Distributors Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET DISTRIBUTOR BY ID
// ========================================

const getDistributorById = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================
    // VALIDATE DISTRIBUTOR ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid distributor ID",
      });
    }

    // ========================================
    // FIND DISTRIBUTOR
    // ========================================

    const distributor = await Distributor.findById(id).populate({
      path: "district",
      select: "name code status region",
      populate: {
        path: "region",
        select: "name code status",
      },
    });

    if (!distributor) {
      return res.status(404).json({
        message: "Distributor not found",
      });
    }

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: "Distributor fetched successfully",
      distributor,
    });
  } catch (error) {
    console.error("Get Distributor Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// UPDATE DISTRIBUTOR
// ========================================

const updateDistributor = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, code, district, address, contactPerson, phone } = req.body;

    // ========================================
    // VALIDATE DISTRIBUTOR ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid distributor ID",
      });
    }

    // ========================================
    // FIND DISTRIBUTOR
    // ========================================

    const distributor = await Distributor.findById(id);

    if (!distributor) {
      return res.status(404).json({
        message: "Distributor not found",
      });
    }

    // ========================================
    // UPDATE NAME
    // ========================================

    if (name) {
      distributor.name = name.trim();
    }

    // ========================================
    // UPDATE CODE
    // ========================================

    if (code) {
      const normalizedCode = code.toUpperCase().trim();

      const existingDistributor = await Distributor.findOne({
        code: normalizedCode,
        _id: { $ne: id },
      });

      if (existingDistributor) {
        return res.status(409).json({
          message: "Distributor code already exists",
        });
      }

      distributor.code = normalizedCode;
    }

    // ========================================
    // UPDATE DISTRICT
    // ========================================

    if (district) {
      // Validate District ID
      if (!mongoose.Types.ObjectId.isValid(district)) {
        return res.status(400).json({
          message: "Invalid district ID",
        });
      }

      // Check whether district actually changed
      const districtChanged =
        distributor.district.toString() !== district.toString();

      if (districtChanged) {
        // ========================================
        // CHECK EXISTING OUTLETS
        // ========================================

        const outletCount = await Outlet.countDocuments({
          distributor: distributor._id,
        });

        if (outletCount > 0) {
          return res.status(400).json({
            message:
              "Cannot change distributor district while outlets are assigned to this distributor",
            outletCount,
          });
        }
      }

      // ========================================
      // FIND NEW DISTRICT
      // ========================================

      const existingDistrict = await District.findById(district);

      if (!existingDistrict) {
        return res.status(404).json({
          message: "District not found",
        });
      }

      // ========================================
      // DISTRICT MUST BE ACTIVE
      // ========================================

      if (existingDistrict.status !== "ACTIVE") {
        return res.status(400).json({
          message: "Cannot assign distributor to an inactive district",
        });
      }

      // ========================================
      // UPDATE DISTRICT
      // ========================================

      distributor.district = district;
    }

    // ========================================
    // UPDATE ADDRESS
    // ========================================

    if (address) {
      distributor.address = address.trim();
    }

    // ========================================
    // UPDATE CONTACT PERSON
    // ========================================

    if (contactPerson) {
      distributor.contactPerson = contactPerson.trim();
    }

    // ========================================
    // UPDATE PHONE
    // ========================================

    if (phone) {
      distributor.phone = phone.trim();
    }

    // ========================================
    // SAVE
    // ========================================

    await distributor.save();

    // ========================================
    // POPULATE DISTRICT → REGION
    // ========================================

    await distributor.populate({
      path: "district",
      select: "name code status region",
      populate: {
        path: "region",
        select: "name code status",
      },
    });

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: "Distributor updated successfully",
      distributor,
    });
  } catch (error) {
    console.error("Update Distributor Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// UPDATE DISTRIBUTOR STATUS
// ========================================

const updateDistributorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ========================================
    // VALIDATE DISTRIBUTOR ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid distributor ID",
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
    // FIND DISTRIBUTOR
    // ========================================

    const distributor = await Distributor.findById(id);

    if (!distributor) {
      return res.status(404).json({
        message: "Distributor not found",
      });
    }

    // ========================================
    // ACTIVATING DISTRIBUTOR
    // ========================================

    if (status === "ACTIVE") {
      // Find District
      const district = await District.findById(distributor.district);

      if (!district) {
        return res.status(404).json({
          message: "District not found",
        });
      }

      // ========================================
      // DISTRICT MUST BE ACTIVE
      // ========================================

      if (district.status !== "ACTIVE") {
        return res.status(400).json({
          message: "Cannot activate distributor under an inactive district",
        });
      }
    }

    // ========================================
    // UPDATE STATUS
    // ========================================

    distributor.status = status;

    await distributor.save();

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: `Distributor status updated to ${status}`,

      distributor: {
        id: distributor._id,
        name: distributor.name,
        code: distributor.code,
        district: distributor.district,
        status: distributor.status,
      },
    });
  } catch (error) {
    console.error("Update Distributor Status Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  createDistributor,
  getDistributors,
  getDistributorById,
  updateDistributor,
  updateDistributorStatus,
};
