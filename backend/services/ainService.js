// GENERATE AIN
const generateAIN = (
    capacity,
    manufacturingMonth,
    manufacturingYear,
    manufacturerCode,
    serialNumber
) => {

    // Format Capacity (4 digits)
    const formattedCapacity = capacity
        .toString()
        .padStart(4, "0");

    // Format Month (2 digits)
    const formattedMonth = manufacturingMonth
        .toString()
        .padStart(2, "0");

    // Format Year (Last 2 digits)
    const formattedYear = manufacturingYear
        .toString()
        .slice(-2);

    // Format Manufacturer Code (2 digits)
    const formattedManufacturerCode = manufacturerCode
        .toString()
        .padStart(2, "0");

    // Return AIN
    return (
        formattedCapacity +
        formattedMonth +
        formattedYear +
        formattedManufacturerCode +
        serialNumber
    );
};

// EXPORT SERVICE
module.exports = {
    generateAIN
};