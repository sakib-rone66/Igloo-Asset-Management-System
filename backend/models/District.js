const mongoose = require("mongoose");

// DISTRICT SCHEMA
const districtSchema = new mongoose.Schema(
  {
    // District name
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Unique district code
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Region reference
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: true,
    },

    // District status
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
const District = mongoose.model("District", districtSchema);

// EXPORT MODEL
module.exports = District;
