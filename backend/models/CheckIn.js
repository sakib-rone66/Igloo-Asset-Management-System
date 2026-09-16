// Import Mongoose
const mongoose = require("mongoose");

// ========================================
// CHECK-IN SCHEMA
// ========================================

const checkInSchema = new mongoose.Schema(
  {
    // User who performed the check-in
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Check-in type
    // OFFICE = office check-in
    // OUTLET = outlet check-in
    checkInType: {
      type: String,
      enum: ["OFFICE", "OUTLET"],
      required: true,
    },

    // Outlet where the user checked in
    // Null for office check-in
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      default: null,
    },

    // GPS latitude
    latitude: {
      type: Number,
      required: true,
    },

    // GPS longitude
    longitude: {
      type: Number,
      required: true,
    },

    // Actual check-in date and time
    checkInTime: {
      type: Date,
      default: Date.now,
    },

    // Optional remarks
    remarks: {
      type: String,
      default: null,
    },
  },

  {
    // Automatically create createdAt and updatedAt
    timestamps: true,
  },
);

// ========================================
// EXPORT MODEL
// ========================================

module.exports = mongoose.model("CheckIn", checkInSchema);
