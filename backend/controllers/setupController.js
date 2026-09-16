const bcrypt = require("bcrypt");
const User = require("../models/User");

const createInitialAdmin = async (req, res) => {
    try {
        // Check if a System Admin already exists
        const existingAdmin = await User.findOne({
            role: "SYSTEM_ADMIN"
        });

        if (existingAdmin) {
            return res.status(403).json({
                message: "Initial System Admin already exists"
            });
        }

        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the first System Admin
        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "SYSTEM_ADMIN"
        });

        // Don't send the password back to the client
        const adminResponse = {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            status: admin.status
        };

        return res.status(201).json({
            message: "Initial System Admin created successfully",
            user: adminResponse
        });

    } catch (error) {
        console.error("Create Initial Admin Error:", error.message);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

module.exports = {
    createInitialAdmin
};