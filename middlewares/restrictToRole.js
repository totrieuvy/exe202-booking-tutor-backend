const restrictToRole = (role) => {
  return (req, res, next) => {
    try {
      const userRole = req.userRole; // Set by verifyToken middleware
      if (!userRole || userRole !== role) {
        return res.status(403).json({
          status: 403,
          message: `Access denied. ${role} role required.`,
        });
      }
      next();
    } catch (error) {
      console.error(`Error in restrictToRole middleware for ${role}:`, error);
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }
  };
};

module.exports = restrictToRole;
