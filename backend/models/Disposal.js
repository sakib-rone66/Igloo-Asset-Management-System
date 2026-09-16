const mongoose = require("mongoose");

// DISPOSAL SCHEMA
const disposalSchema = new mongoose.Schema(
    {
        // Asset being disposed
        asset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Asset",
            required: true,
            unique: true
        },
        // User who performed the disposal
        disposedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        // Reason for disposal
        reason: {
            type: String,
            required: true,
            trim: true
        },
        // Disposal date
        disposalDate: {
            type: Date,
            default: Date.now
        },
        // Additional remarks
        remarks: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// EXPORT MODEL
const Disposal = mongoose.model(
    "Disposal",
    disposalSchema
);

module.exports = Disposal;