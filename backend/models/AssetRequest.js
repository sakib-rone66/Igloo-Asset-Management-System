const mongoose = require("mongoose");

// ========================================
// ASSET REQUEST SCHEMA
// ========================================

const assetRequestSchema = new mongoose.Schema(
  {
    // Outlet where assets are requested
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
    },

    // User who created the request
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

    // Number of assets requested
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Reason for request
    reason: {
      type: String,
      required: true,
      trim: true,
    },

    // Additional remarks
    remarks: {
      type: String,
      trim: true,
      default: null,
    },

    // Request status
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      required: true,
    },

    // Admin who reviewed the request
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Review date
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ========================================
// INDEXES
// ========================================

assetRequestSchema.index({
  requestedBy: 1,
  createdAt: -1,
});

assetRequestSchema.index({
  status: 1,
  createdAt: -1,
});

assetRequestSchema.index({
  outlet: 1,
  createdAt: -1,
});

module.exports = mongoose.model("AssetRequest", assetRequestSchema);
