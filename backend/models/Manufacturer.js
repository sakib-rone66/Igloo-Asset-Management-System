const mongoose = require("mongoose");

const manufacturerSchema = new mongoose.Schema(
    {
        // Manufacturer name
        // Example: Aucma, Ugar, Walton
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        // Automatically generated 2-digit code
        // Example: 01 = Aucma, 02 = Ugar, 03 = Walton
        code: {
            type: String,
            required: true,
            unique: true
        },
        // Manufacturer status
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

const Manufacturer = mongoose.model("Manufacturer",manufacturerSchema);

module.exports = Manufacturer;