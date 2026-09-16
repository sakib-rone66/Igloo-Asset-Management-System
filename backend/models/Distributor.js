const mongoose = require("mongoose");

// DISTRIBUTOR SCHEMA
const distributorSchema = new mongoose.Schema(
  {
    // Distributor name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Unique distributor code
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // District reference
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: true,
    },

    // Distributor address
    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Contact person
    contactPerson: {
      type: String,
      trim: true,
    },

    // Phone number
    phone: {
      type: String,
      trim: true,
    },

    // Distributor status
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

// CREATE MODEL
const Distributor = mongoose.model("Distributor", distributorSchema);

// EXPORT MODEL
module.exports = Distributor;
