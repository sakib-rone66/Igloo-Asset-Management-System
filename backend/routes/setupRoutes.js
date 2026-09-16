const express = require("express");

const {
    createInitialAdmin
} = require("../controllers/setupController");

const router = express.Router();

// One-time route for creating the first System Admin
router.post("/admin", createInitialAdmin);

module.exports = router;