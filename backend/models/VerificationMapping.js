const mongoose = require("mongoose");

const verificationMappingSchema = new mongoose.Schema(
  {
    // ========================================
    // ASSET
    // ========================================

    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    // ========================================
    // SELECTED OUTLET
    // ========================================

    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
    },

    // ========================================
    // USER WHO SUBMITTED THE MAPPING
    // ========================================

    submittedBy: {
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
    // MAPPING STATUS
    // ========================================

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    // ========================================
    // USER REMARKS
    // ========================================

    remarks: {
      type: String,
      trim: true,
      default: null,
    },

    // ========================================
    // ADMIN REVIEW
    // ========================================

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    // ========================================
    // ADMIN REJECTION REMARKS
    // ========================================

    rejectionRemarks: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "VerificationMapping",
  verificationMappingSchema,
);
