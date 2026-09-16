const mongoose = require("mongoose");

const authorizationSchema = new mongoose.Schema(
  {
    // ========================================
    // ASSET TYPE
    // ========================================

    assetType: {
      type: String,
      enum: ["NEW", "EXISTING"],
      required: true,
    },

    // ========================================
    // ASSET INFORMATION
    // ========================================

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    manufacturingMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    manufacturingYear: {
      type: Number,
      required: true,
      min: 2000,
    },

    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manufacturer",
      required: true,
    },

    // ========================================
    // EXISTING ASSET OUTLET
    //
    // For NEW asset:
    // currentOutlet = null
    //
    // For EXISTING asset:
    // currentOutlet = already assigned outlet
    // ========================================

    currentOutlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      default: null,
    },

    // ========================================
    // AUTHORIZATION INFORMATION
    // ========================================

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ========================================
    // APPROVAL INFORMATION
    // ========================================

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    decisionDate: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ========================================
// MODEL
// ========================================

const Authorization = mongoose.model("Authorization", authorizationSchema);

module.exports = Authorization;
