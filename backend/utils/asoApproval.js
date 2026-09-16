const User = require("../models/User");

const getRequesterAso = async (userId) => {
  const user = await User.findById(userId).select(
    "role assignedAso assignedTso",
  );
  return ["ASO", "TECHNICIAN"].includes(user?.role)
    ? user.assignedTso || null
    : user?.assignedAso || null;
};

const canReviewRequest = async (req, request) => {
  if (req.user.role === "SYSTEM_ADMIN") return true;

  if (
    req.user.role === "TSO" &&
    request.assignedAso &&
    request.assignedAso.toString() === req.user.userId.toString()
  ) {
    return true;
  }

  if (req.user.role !== "TSM" || !request.requestedBy) return false;

  const requester = await User.findById(request.requestedBy).select("role");
  return requester?.role === "TSO";
};

const asoRequestFilter = async (req) => {
  if (req.user.role === "SYSTEM_ADMIN") return {};
  if (req.user.role === "TSO") return { assignedAso: req.user.userId };

  if (req.user.role === "TSM") {
    const tsoIds = await User.find({ role: "TSO" }).distinct("_id");
    return { requestedBy: { $in: tsoIds } };
  }

  return { assignedAso: req.user.userId };
};

module.exports = { getRequesterAso, canReviewRequest, asoRequestFilter };
