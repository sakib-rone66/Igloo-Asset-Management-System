const mongoose = require("mongoose");

const Outlet = require("../models/Outlet");
const District = require("../models/District");
const Distributor = require("../models/Distributor");
const Asset = require("../models/Asset");

// ========================================
// CREATE OUTLET
// Any authenticated user can create outlet
// ========================================

const createOutlet = async (req, res) => {
  try {
    const {
      name,
      code,
      type,
      address,
      district,
      distributor,
      contactPerson,
      phone,
    } = req.body;

    // ========================================
    // REQUIRED FIELDS
    // ========================================

    if (!name || !code || !type || !address || !district || !phone) {
      return res.status(400).json({
        message: "Name, code, type, address, district and phone are required",
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

    // District must be active
    if (existingDistrict.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Cannot create outlet under an inactive district",
      });
    }

    // ========================================
    // VALIDATE DISTRIBUTOR
    // ========================================

    if (distributor) {
      if (!mongoose.Types.ObjectId.isValid(distributor)) {
        return res.status(400).json({
          message: "Invalid distributor ID",
        });
      }

      const existingDistributor = await Distributor.findById(distributor);

      if (!existingDistributor) {
        return res.status(404).json({
          message: "Distributor not found",
        });
      }

      // Distributor must be active
      if (existingDistributor.status !== "ACTIVE") {
        return res.status(400).json({
          message: "Cannot assign an inactive distributor to outlet",
        });
      }

      // Distributor must belong to selected district
      if (existingDistributor.district.toString() !== district.toString()) {
        return res.status(400).json({
          message: "Distributor does not belong to selected district",
        });
      }
    }

    // ========================================
    // NORMALIZE OUTLET CODE
    // ========================================

    const normalizedCode = code.toUpperCase().trim();
    const normalizedPhone = phone.trim();

    // ========================================
    // CHECK DUPLICATE OUTLET CODE AND PHONE
    // ========================================

    const existingOutlet = await Outlet.findOne({
      $or: [{ code: normalizedCode }, { phone: normalizedPhone }],
    });

    if (existingOutlet) {
      const isDuplicateCode = existingOutlet.code === normalizedCode;

      return res.status(409).json({
        message: isDuplicateCode
          ? "Outlet code already exists"
          : "Outlet phone number already exists",
        field: isDuplicateCode ? "code" : "phone",
      });
    }

    // ========================================
    // CREATE OUTLET
    // ========================================

    const outlet = await Outlet.create({
      name: name.trim(),
      code: normalizedCode,
      type: type.trim(),
      address: address.trim(),
      district,
      distributor: distributor || null,
      contactPerson: contactPerson ? contactPerson.trim() : "",
      phone: normalizedPhone,
    });

    // ========================================
    // POPULATE DISTRICT + REGION
    // ========================================

    await outlet.populate({
      path: "district",
      select: "name code status region",
      populate: {
        path: "region",
        select: "name code status",
      },
    });

    // ========================================
    // POPULATE DISTRIBUTOR
    // ========================================

    await outlet.populate({
      path: "distributor",
      select: "name code district status",
    });

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({
      message: "Outlet created successfully",
      outlet,
    });
  } catch (error) {
    console.error("Create Outlet Error:", error.message);

    if (error.code === 11000) {
      const field = error.keyPattern?.phone ? "phone" : "code";

      return res.status(409).json({
        message:
          field === "phone"
            ? "Outlet phone number already exists"
            : "Outlet code already exists",
        field,
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET ALL / SEARCH OUTLETS
// ========================================

const getOutlets = async (req, res) => {
  try {
    const { district, distributor, phone, search, status } = req.query;

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
    // FILTER BY DISTRIBUTOR
    // ========================================

    if (distributor) {
      if (!mongoose.Types.ObjectId.isValid(distributor)) {
        return res.status(400).json({
          message: "Invalid distributor ID",
        });
      }

      filter.distributor = distributor;
    }

    // ========================================
    // SEARCH BY PHONE
    // ========================================

    if (phone) {
      filter.phone = phone.trim();
    }

    // ========================================
    // SEARCH BY NAME OR PHONE
    // ========================================

    if (search?.trim()) {
      const searchValue = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { name: { $regex: searchValue, $options: "i" } },
        { phone: { $regex: searchValue, $options: "i" } },
      ];
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
    // GET OUTLETS
    // ========================================

    const outlets = await Outlet.find(filter)
      .populate({
        path: "district",
        select: "name code status region",
        populate: {
          path: "region",
          select: "name code status",
        },
      })
      .populate("distributor", "name code district status")
      .sort({ name: 1 });

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: "Outlets fetched successfully",
      count: outlets.length,
      outlets,
    });
  } catch (error) {
    console.error("Get Outlets Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET OUTLET BY ID
// ========================================

const getOutletById = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================
    // VALIDATE ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid outlet ID",
      });
    }

    // ========================================
    // FIND OUTLET
    // ========================================

    const outlet = await Outlet.findById(id)
      .populate({
        path: "district",
        select: "name code status region",
        populate: {
          path: "region",
          select: "name code status",
        },
      })
      .populate("distributor", "name code district status");

    // ========================================
    // NOT FOUND
    // ========================================

    if (!outlet) {
      return res.status(404).json({
        message: "Outlet not found",
      });
    }

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: "Outlet fetched successfully",
      outlet,
    });
  } catch (error) {
    console.error("Get Outlet Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// GET EXISTING / DEPLOYED ASSETS OF OUTLET
// ========================================
//
// Existing asset means:
// Asset is already deployed to this outlet.
//
// Conditions:
// currentOutlet = outlet ID
// status = ASSIGNED
//
// ========================================

const getOutletAssets = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================
    // VALIDATE OUTLET ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid outlet ID",
      });
    }

    // ========================================
    // CHECK OUTLET
    // ========================================

    const outlet = await Outlet.findById(id);

    if (!outlet) {
      return res.status(404).json({
        message: "Outlet not found",
      });
    }

    // ========================================
    // FIND DEPLOYED ASSETS
    // ========================================

    const assets = await Asset.find({
      currentOutlet: id,
      status: "ASSIGNED",
    })
      .populate("manufacturer", "name code")
      .sort({ ain: 1 });

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: "Outlet assets fetched successfully",
      count: assets.length,
      assets,
    });
  } catch (error) {
    console.error("Get Outlet Assets Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// UPDATE OUTLET
// ========================================

const updateOutlet = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      code,
      type,
      address,
      district,
      distributor,
      contactPerson,
      phone,
    } = req.body;

    // ========================================
    // VALIDATE OUTLET ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid outlet ID",
      });
    }

    // ========================================
    // FIND OUTLET
    // ========================================

    const outlet = await Outlet.findById(id);

    if (!outlet) {
      return res.status(404).json({
        message: "Outlet not found",
      });
    }

    // ========================================
    // BASIC INFORMATION
    // ========================================

    if (name) {
      outlet.name = name.trim();
    }

    if (type) {
      outlet.type = type.trim();
    }

    if (address) {
      outlet.address = address.trim();
    }

    if (contactPerson !== undefined) {
      outlet.contactPerson = contactPerson.trim();
    }

    // ========================================
    // UPDATE CODE AND PHONE
    // ========================================

    const normalizedCode = code ? code.toUpperCase().trim() : outlet.code;
    const normalizedPhone = phone ? phone.trim() : outlet.phone;

    const existingOutlet = await Outlet.findOne({
      $or: [{ code: normalizedCode }, { phone: normalizedPhone }],
      _id: { $ne: id },
    });

    if (existingOutlet) {
      const isDuplicateCode = existingOutlet.code === normalizedCode;

      return res.status(409).json({
        message: isDuplicateCode
          ? "Outlet code already exists"
          : "Outlet phone number already exists",
        field: isDuplicateCode ? "code" : "phone",
      });
    }

    if (code) {
      outlet.code = normalizedCode;
    }

    if (phone) {
      outlet.phone = normalizedPhone;
    }

    // ========================================
    // UPDATE DISTRICT
    // ========================================

    if (district) {
      if (!mongoose.Types.ObjectId.isValid(district)) {
        return res.status(400).json({
          message: "Invalid district ID",
        });
      }

      const existingDistrict = await District.findById(district);

      if (!existingDistrict) {
        return res.status(404).json({
          message: "District not found",
        });
      }

      if (existingDistrict.status !== "ACTIVE") {
        return res.status(400).json({
          message: "Cannot assign outlet to an inactive district",
        });
      }

      outlet.district = district;
    }

    // ========================================
    // UPDATE DISTRIBUTOR
    // ========================================

    if (distributor !== undefined) {
      if (distributor === "") {
        outlet.distributor = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(distributor)) {
          return res.status(400).json({
            message: "Invalid distributor ID",
          });
        }

        const existingDistributor = await Distributor.findById(distributor);

        if (!existingDistributor) {
          return res.status(404).json({
            message: "Distributor not found",
          });
        }

        if (existingDistributor.status !== "ACTIVE") {
          return res.status(400).json({
            message: "Cannot assign inactive distributor",
          });
        }

        const selectedDistrict = district || outlet.district;

        if (
          existingDistributor.district.toString() !==
          selectedDistrict.toString()
        ) {
          return res.status(400).json({
            message: "Distributor does not belong to selected district",
          });
        }

        outlet.distributor = distributor;
      }
    }

    // ========================================
    // SAVE
    // ========================================

    await outlet.save();

    // ========================================
    // POPULATE
    // ========================================

    await outlet.populate({
      path: "district",
      select: "name code status region",
      populate: {
        path: "region",
        select: "name code status",
      },
    });

    await outlet.populate({
      path: "distributor",
      select: "name code district status",
    });

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: "Outlet updated successfully",
      outlet,
    });
  } catch (error) {
    console.error("Update Outlet Error:", error.message);

    if (error.code === 11000) {
      const field = error.keyPattern?.phone ? "phone" : "code";

      return res.status(409).json({
        message:
          field === "phone"
            ? "Outlet phone number already exists"
            : "Outlet code already exists",
        field,
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// UPDATE OUTLET STATUS
// ========================================

const updateOutletStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ========================================
    // VALIDATE ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid outlet ID",
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
    // FIND OUTLET
    // ========================================

    const outlet = await Outlet.findById(id);

    if (!outlet) {
      return res.status(404).json({
        message: "Outlet not found",
      });
    }

    // ========================================
    // UPDATE STATUS
    // ========================================

    outlet.status = status;

    await outlet.save();

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message: `Outlet status updated to ${status}`,
      outlet: {
        id: outlet._id,
        name: outlet.name,
        code: outlet.code,
        status: outlet.status,
      },
    });
  } catch (error) {
    console.error("Update Outlet Status Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  createOutlet,
  getOutlets,
  getOutletById,
  getOutletAssets,
  updateOutlet,
  updateOutletStatus,
};
