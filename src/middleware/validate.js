const validate = (schema) => (req, res, next) => {
  try {
    // 1. Combine the parts of the request you need to validate
    const dataToValidate = {
      body: req.body,
      query: req.query,
      params: req.params,
    };
    
    // 2. Safely parse the data against the defined schema
    // The .parse() method throws an error if validation fails
    schema.parse(dataToValidate);
    
    // 3. If parsing succeeds, move to the next middleware/controller
    next();
  } catch (error) {
    // 4. Handle Zod validation errors (Zod errors are detailed and structured)
    if (error.issues) {
      // Structure the errors for a clean API response
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues.map(issue => ({
          path: issue.path.join('.'), // e.g., 'body.email'
          message: issue.message
        }))
      });
    }
    // Handle any non-Zod errors
    next(error); 
  }
};

module.exports = validate;