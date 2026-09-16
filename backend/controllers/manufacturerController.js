const Manufacturer = require("../models/Manufacturer");

// Create or POST a new manufacturer
const createManufacturer = async (req, res) => {
    try {
        const { name } = req.body;

        // Check required field
        if (!name) {
            return res.status(400).json({
                message: "Manufacturer name is required"
            });
        }

        // Remove extra spaces
        const normalizedName = name.trim();

        // Check duplicate manufacturer name
        const existingManufacturer = await Manufacturer.findOne({
            name: normalizedName
        });

        if (existingManufacturer) {
            return res.status(409).json({
                message: "Manufacturer already exists"
            });
        }

        // Find the latest manufacturer code
        const lastManufacturer = await Manufacturer.findOne()
            .sort({ code: -1 });

        // Start with code 01
        let nextCodeNumber = 1;

        // If manufacturer already exists,
        // generate the next code
        if (lastManufacturer) {
            nextCodeNumber =
                parseInt(lastManufacturer.code, 10) + 1;
        }

        // Convert number to 2-digit code
        // Example:
        // 1  → 01
        // 2  → 02
        // 10 → 10
        const nextCode = String(nextCodeNumber)
            .padStart(2, "0");

        // Prevent exceeding 99 manufacturers
        if (nextCodeNumber > 99) {
            return res.status(400).json({
                message: "Manufacturer code limit reached"
            });
        }

        // Create manufacturer
        const manufacturer = await Manufacturer.create({
            name: normalizedName,
            code: nextCode
        });

        return res.status(201).json({
            message: "Manufacturer created successfully",
            manufacturer
        });

    } catch (error) {
        console.error(
            "Create Manufacturer Error:",
            error.message
        );

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

// READ or GET all manufacturers
const getManufacturers = async (req, res) => {
    try {
        // Get all manufacturers from database
        const manufacturers = await Manufacturer.find()
            .sort({ code: 1 });

        return res.status(200).json({
            message: "Manufacturers fetched successfully",
            count: manufacturers.length,
            manufacturers
        });

    } catch (error) {
        console.error(
            "Get Manufacturers Error:",
            error.message
        );

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

//READ or GET by ID
const getManufacturerById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find manufacturer by MongoDB ID
        const manufacturer = await Manufacturer.findById(id);

        // Manufacturer not found
        if (!manufacturer) {
            return res.status(404).json({
                message: "Manufacturer not found"
            });
        }

        return res.status(200).json({
            message: "Manufacturer fetched successfully",
            manufacturer
        });

    } catch (error) {
        console.error(
            "Get Manufacturer By ID Error:",
            error.message
        );

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

//UPDATE Manufacturer only name
const updateManufacturer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Check if manufacturer name is provided
        if (!name) {
            return res.status(400).json({
                message: "Manufacturer name is required"
            });
        }

        // Remove extra spaces
        const normalizedName = name.trim();

        // Find manufacturer
        const manufacturer = await Manufacturer.findById(id);

        // Manufacturer not found
        if (!manufacturer) {
            return res.status(404).json({
                message: "Manufacturer not found"
            });
        }

        // Check if another manufacturer already
        // uses the new name
        const existingManufacturer =
            await Manufacturer.findOne({
                name: normalizedName,
                _id: { $ne: id }
            });

        if (existingManufacturer) {
            return res.status(409).json({
                message: "Manufacturer name already exists"
            });
        }

        // Update only the name
        manufacturer.name = normalizedName;

        await manufacturer.save();

        return res.status(200).json({
            message: "Manufacturer updated successfully",
            manufacturer
        });

    } catch (error) {
        console.error(
            "Update Manufacturer Error:",
            error.message
        );

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

//Manufacturer Status ACTIVE OR DEACTIVE
const updateManufacturerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
            return res.status(400).json({
                message: "Status must be ACTIVE or INACTIVE"
            });
        }

        // Find manufacturer
        const manufacturer = await Manufacturer.findById(id);

        // Manufacturer not found
        if (!manufacturer) {
            return res.status(404).json({
                message: "Manufacturer not found"
            });
        }

        // Update status
        manufacturer.status = status;

        await manufacturer.save();

        return res.status(200).json({
            message: "Manufacturer status updated successfully",
            manufacturer: {
                id: manufacturer._id,
                name: manufacturer.name,
                code: manufacturer.code,
                status: manufacturer.status
            }
        });

    } catch (error) {
        console.error(
            "Update Manufacturer Status Error:",
            error.message
        );

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};


module.exports = {
    createManufacturer,
    getManufacturers,
    getManufacturerById,
    updateManufacturer,
    updateManufacturerStatus
};