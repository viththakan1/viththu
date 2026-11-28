import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'haveitall_secure_jwt_secret_key_prod_2026_fallback';
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Generate a signed JSON Web Token
 */
export const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify a JSON Web Token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

/**
 * Hash a plain password using bcrypt
 */
export const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') return '';
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

/**
 * Compare password: supports both bcrypt hashes and graceful migration of legacy plaintext passwords
 */
export const comparePassword = async (plainPassword, storedHashOrPlain) => {
  if (!plainPassword || !storedHashOrPlain) return false;

  // If stored value is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  if (/^\$2[aby]\$\d{2}\$/.test(storedHashOrPlain)) {
    return await bcrypt.compare(plainPassword, storedHashOrPlain);
  }

  // Fallback for legacy plaintext password migration
  return plainPassword === storedHashOrPlain;
};

/**
 * Express middleware to authenticate requests via Bearer token
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-access-token'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Token format invalid.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
  }

  req.user = decoded;
  next();
};

/**
 * Express middleware for Role-Based Access Control (RBAC)
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRole = String(req.user.role || '').toLowerCase();
    const isAllowed = allowedRoles.some(r => r.toLowerCase() === userRole);

    if (!isAllowed) {
      return res.status(403).json({
        error: `Forbidden: Access requires ${allowedRoles.join(' or ')} privileges.`
      });
    }

    next();
  };
};

/**
 * Express middleware to optionally extract user token if provided
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-access-token'];
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
  }
  next();
};
