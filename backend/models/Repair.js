const mongoose = require("mongoose");

const repairSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    problem: {
      type: String,
      required: true,
      trim: true,
    },

    serviceProvider: {
      type: String,
      trim: true,
      default: "",
    },

    remarks: {
      type: String,
      required: true,
      trim: true,
    },

    repairCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "UNDER_REPAIR", "COMPLETED", "REJECTED"],
      default: "PENDING",
    },

    completedDate: {
      type: Date,
      default: null,
    },

    rejectedDate: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Repair", repairSchema);
