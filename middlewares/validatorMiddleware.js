const { validationResult } = require("express-validator");

const validatorMiddleware = // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // Proceed to the next middleware (the actual handler)
  };
module.exports = validatorMiddleware;
