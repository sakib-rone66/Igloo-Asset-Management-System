const mongoose = require("mongoose");

// ASSET SCHEMA
const assetSchema = new mongoose.Schema(
  {
    // Asset Identification Number
    ain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Auto Generated Serial Number
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Freezer Capacity (Liter)
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Manufacturing Month
    manufacturingMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    // Manufacturing Year
    manufacturingYear: {
      type: Number,
      required: true,
    },

    // Manufacturer
    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manufacturer",
      required: true,
    },

    // ASSET ACTIVATION INFORMATION
    isActivated: {
      type: Boolean,
      default: false,
    },

    // Date and time when the asset was activated
    activatedAt: {
      type: Date,
      default: null,
    },

    // User who activated the asset
    activatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Authorization Reference
    authorization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Authorization",
      required: true,
    },

    // CURRENT LOCATION
    currentOutlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      default: null,
    },

    // ASSET LIFECYCLE STATUS
    status: {
      type: String,
      enum: ["IN_STOCK", "ASSIGNED", "UNDER_REPAIR", "DISPOSED"],
      default: "IN_STOCK",
    },

    // ASSET VERIFICATION STATUS
    verificationStatus: {
      type: String,
      enum: ["NOT_VERIFIED", "VERIFIED", "NOT_FOUND", "DAMAGED"],
      default: "NOT_VERIFIED",
    },

    // Date and time of the latest physical verification
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
  },

  {
    // Automatically creates:
    // createdAt
    // updatedAt
    timestamps: true,
  },
);

// CREATE MODEL
const Asset = mongoose.model("Asset", assetSchema);

// EXPORT MODEL
module.exports = Asset;
