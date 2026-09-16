const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {

        // Check if authenticated user exists
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Check if user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You do not have permission to perform this action"
            });
        }

        // User has permission
        next();
    };
};

module.exports = roleMiddleware;