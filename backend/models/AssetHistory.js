const mongoose = require("mongoose");

// ASSET HISTORY SCHEMA
const assetHistorySchema = new mongoose.Schema(
    {
        // Asset reference
        asset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Asset",
            required: true
        },
        // Previous outlet
        fromOutlet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Outlet",
            default: null
        },
        // New outlet
        toOutlet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Outlet",
            default: null
        },
        // Action performed
        action: {
            type: String,
            enum: [
                "ASSIGNED",
                "TRANSFERRED",
                "REPAIRED",
                "RETURNED",
                "DISPOSED"
            ],
            required: true
        },
        // User who performed the action
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        // Optional remarks
        remarks: {
            type: String,
            trim: true,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// CREATE MODEL
const AssetHistory = mongoose.model("AssetHistory",assetHistorySchema);

// EXPORT MODEL
module.exports = AssetHistory;