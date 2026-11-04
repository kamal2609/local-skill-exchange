const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Attach validated data
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: error.errors
        ? error.errors.map((e) => ({
            field: e.path.slice(1).join('.') || e.path[0] || 'general',
            message: e.message,
          }))
        : [{ message: error.message }],
    });
  }
};

module.exports = validate;
