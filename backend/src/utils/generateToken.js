const jwt = require('jsonwebtoken');

/**
 * Generate a signed JSON Web Token
 * @param {string} id - User ObjectId string
 * @param {string} role - User role (LEARNER, PROVIDER, ADMIN)
 * @returns {string} - Signed JWT
 */
const generateToken = (id, role = 'LEARNER') => {
  const secret = process.env.JWT_SECRET || 'super_secret_local_skill_exchange_jwt_key_2026';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '7d',
  });
};

module.exports = generateToken;
