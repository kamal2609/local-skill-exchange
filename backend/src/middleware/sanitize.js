/**
 * NoSQL Injection Sanitization Middleware
 * Recursively cleans object keys starting with '$' or containing '.'
 * to prevent MongoDB query operator injection.
 */

function cleanObject(payload) {
  if (Array.isArray(payload)) {
    return payload.map(cleanObject);
  }

  if (payload !== null && typeof payload === 'object' && !(payload instanceof Date)) {
    const clean = {};
    for (const [key, value] of Object.entries(payload)) {
      // Strip any key starting with '$' or containing '.'
      if (!key.startsWith('$') && !key.includes('.')) {
        clean[key] = cleanObject(value);
      }
    }
    return clean;
  }

  return payload;
}

const sanitize = (req, res, next) => {
  if (req.body) {
    req.body = cleanObject(req.body);
  }
  if (req.query) {
    req.query = cleanObject(req.query);
  }
  if (req.params) {
    req.params = cleanObject(req.params);
  }
  next();
};

module.exports = {
  sanitize,
  cleanObject,
};

