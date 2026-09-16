const mongoose = require("mongoose");

// COUNTER SCHEMA
const counterSchema = new mongoose.Schema(
    {
        // Counter name
        // Example: ASSET_SN
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },
        // Current value
        value: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);
// COUNTER MODEL
const Counter = mongoose.model("Counter",counterSchema);

// EXPORT MODEL
module.exports = Counter;