const Disposal = require("../models/Disposal");
const Asset = require("../models/Asset");

// DISPOSE ASSET
const disposeAsset = async (req, res) => {
    try {
        const {
            assetId,
            reason,
            remarks
        } = req.body;

        // CHECK REQUIRED FIELDS
        if (!assetId || !reason) {
            return res.status(400).json({
                message:
                    "Asset ID and disposal reason are required"
            });
        }

        // FIND ASSET
        const asset = await Asset.findById(assetId);

        if (!asset) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }

        // PREVENT DISPOSAL OF ALREADY DISPOSED ASSET
        if (asset.status === "DISPOSED") {
            return res.status(400).json({
                message: "Asset is already disposed"
            });
        }

        // ASSET CANNOT BE DISPOSED WHILE UNDER REPAIR
        if (asset.status === "UNDER_REPAIR") {
            return res.status(400).json({
                message:
                    "Asset cannot be disposed while under repair"
            });
        }

        // CREATE DISPOSAL RECORD
        const disposal = await Disposal.create({
            asset: asset._id,
            disposedBy: req.user.userId,
            reason,
            remarks
        });

        // UPDATE ASSET
        asset.status = "DISPOSED";

        // DISPOSED ASSET NO LONGER BELONGS TO AN OUTLET
        asset.currentOutlet = null;
        await asset.save();

        return res.status(201).json({
            message: "Asset disposed successfully",
            disposal,
            asset
        });

    }catch(error){
        console.error(
            "Dispose Asset Error:",
            error.message
        );
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};

// GET DISPOSAL DETAILS BY ASSET
const getDisposalByAsset = async (req, res) => {
    try {
        const { assetId } = req.params;

        // FIND ASSET
        const asset = await Asset.findById(assetId);
        if (!asset) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }

        // FIND DISPOSAL RECORD
        const disposal = await Disposal.findOne({
            asset: assetId
        })
            .populate("disposedBy", "name email")
            .populate("asset", "ain serialNumber capacity");

        // DISPOSAL RECORD NOT FOUND
        if (!disposal) {
            return res.status(404).json({
                message:
                    "Disposal record not found for this asset"
            });
        }
        return res.status(200).json({
            message: "Disposal details fetched successfully",
            disposal
        });

    }catch(error){
        console.error(
            "Get Disposal Details Error:",
            error.message
        );
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};

// EXPORT
module.exports = {
    disposeAsset,
    getDisposalByAsset
};