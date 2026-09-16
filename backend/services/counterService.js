const Counter = require("../models/Counter");

// GET NEXT SEQUENCE NUMBER
const getNextSequence = async (key) => {
    try {
        const counter = await Counter.findOneAndUpdate(
            { key },
            {
                $inc: {
                    value: 1
                }
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );
        return counter.value;
    } catch (error) {
        console.error(
            "Counter Service Error:",
            error.message
        );
        throw error;
    }
};

// EXPORT SERVICE
module.exports = {
    getNextSequence
};