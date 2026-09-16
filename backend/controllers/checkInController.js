const CheckIn = require("../models/CheckIn");
const Outlet = require("../models/Outlet");

// ========================================
// CREATE CHECK-IN
// ========================================

const createCheckIn = async (req, res) => {
  try {
    const { checkInType, outletId, latitude, longitude, remarks } = req.body;

    // ========================================
    // CHECK CHECK-IN TYPE
    // ========================================

    if (!checkInType) {
      return res.status(400).json({
        message: "Check-in type is required",
      });
    }

    // ========================================
    // VALIDATE CHECK-IN TYPE
    // ========================================

    if (!["OFFICE", "OUTLET"].includes(checkInType)) {
      return res.status(400).json({
        message: "Check-in type must be OFFICE or OUTLET",
      });
    }

    // ========================================
    // CHECK LOCATION
    // ========================================

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    // ========================================
    // OFFICE CHECK-IN
    // ========================================

    if (checkInType === "OFFICE") {
      if (outletId) {
        return res.status(400).json({
          message: "Office check-in cannot have an outlet",
        });
      }
    }

    // ========================================
    // OUTLET CHECK-IN
    // ========================================

    if (checkInType === "OUTLET") {
      if (!outletId) {
        return res.status(400).json({
          message: "Outlet ID is required for outlet check-in",
        });
      }

      // Find outlet
      const outlet = await Outlet.findById(outletId);

      if (!outlet) {
        return res.status(404).json({
          message: "Outlet not found",
        });
      }

      // Outlet must be active
      if (outlet.status !== "ACTIVE") {
        return res.status(400).json({
          message: "This outlet is currently inactive",
        });
      }
    }

    // ========================================
    // CREATE CHECK-IN
    // ========================================

    const checkIn = await CheckIn.create({
      user: req.user.userId,

      checkInType,

      outlet: checkInType === "OUTLET" ? outletId : null,

      latitude,

      longitude,

      remarks: remarks || null,
    });

    return res.status(201).json({
      message: `${checkInType} check-in successful`,

      checkIn,
    });
  } catch (error) {
    console.error("Create Check-in Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// GET MY CHECK-IN HISTORY
// ========================================

const getMyCheckInHistory = async (req, res) => {
  try {
    const { date, timezoneOffset } = req.query;
    const checkInFilter = {
      user: req.user.userId,
    };

    if (date) {
      checkInFilter.checkInTime = {};
      const offset = timezoneOffset === undefined ? 0 : Number(timezoneOffset);
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isInteger(offset) ||
        offset < -840 ||
        offset > 840 ||
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
      ) {
        return res.status(400).json({
          message: "Invalid date.",
        });
      }

      startDate.setUTCMinutes(startDate.getUTCMinutes() + offset);
      endDate.setUTCMinutes(endDate.getUTCMinutes() + offset);

      checkInFilter.checkInTime.$gte = startDate;
      checkInFilter.checkInTime.$lte = endDate;
    }

    // Find only the logged-in user's records
    const history = await CheckIn.find(checkInFilter)

      // Get user information
      .populate("user", "_id name email")

      // Get outlet information
      .populate("outlet", "name outletCode")

      // Newest records first
      .sort({
        checkInTime: -1,
      });

    return res.status(200).json({
      message: "Your check-in history fetched successfully",

      count: history.length,

      history,
    });
  } catch (error) {
    console.error("Get My Check-In History Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL USERS' CHECK-IN HISTORY
// ========================================

const getAllCheckInHistory = async (req, res) => {
  try {
    // Find check-in records for all users
    const history = await CheckIn.find()

      // Get user ID, name and email
      .populate("user", "_id name email")

      // Get outlet information
      .populate("outlet", "name outletCode")

      // Newest records first
      .sort({
        checkInTime: -1,
      });

    return res.status(200).json({
      message: "All users check-in history fetched successfully",

      count: history.length,

      history,
    });
  } catch (error) {
    console.error("Get All Check-In History Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// GET LATEST CHECK-IN
// ========================================

const getLatestCheckIn = async (req, res) => {
  try {
    // Get latest check-in of logged-in user
    const checkIn = await CheckIn.findOne({
      user: req.user.userId,
    })
      .populate("outlet", "name outletCode")
      .sort({
        checkInTime: -1,
      });

    // No check-in found
    if (!checkIn) {
      return res.status(404).json({
        message: "No check-in found",
      });
    }

    return res.status(200).json({
      message: "Latest check-in fetched successfully",

      checkIn,
    });
  } catch (error) {
    console.error("Get Latest Check-In Error:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
  createCheckIn,
  getMyCheckInHistory,
  getAllCheckInHistory,
  getLatestCheckIn,
};
