const validate = (schema) => (req, res, next) => {
  try {
    if (schema.shape && (schema.shape.body || schema.shape.query || schema.shape.params)) {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;
    } else {
      req.body = schema.parse(req.body);
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: error.errors
        ? error.errors.map((e) => ({
            field: e.path.join('.') || 'general',
            message: e.message,
          }))
        : [{ message: error.message }],
    });
  }
};

module.exports = validate;

