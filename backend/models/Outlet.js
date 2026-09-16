const mongoose = require("mongoose");

const outletSchema = new mongoose.Schema(
  {
    // ========================================
    // OUTLET BASIC INFORMATION
    // ========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    // ========================================
    // LOCATION HIERARCHY
    // Region
    //   ↓
    // District
    //   ↓
    // Distributor
    //   ↓
    // Outlet
    // ========================================

    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: true,
    },

    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributor",
      default: null,
    },

    // ========================================
    // CONTACT INFORMATION
    // ========================================

    contactPerson: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      trim: true,
    },

    // ========================================
    // STATUS
    // ========================================

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Outlet", outletSchema);
