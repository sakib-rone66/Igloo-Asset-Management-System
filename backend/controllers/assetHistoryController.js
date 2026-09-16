const AssetHistory = require("../models/AssetHistory");

// GET ASSET HISTORY
const getAssetHistory = async (req, res) => {
  try {
    const { assetId } = req.params;

    // Find all history records for this asset
    const history = await AssetHistory.find({
      asset: assetId,
    })
      .populate("asset", "ain serialNumber")
      .populate("fromOutlet", "name outletCode")
      .populate("toOutlet", "name outletCode")
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Asset history fetched successfully",
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Get Asset History Error:", error.message);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// EXPORT
module.exports = { getAssetHistory };
