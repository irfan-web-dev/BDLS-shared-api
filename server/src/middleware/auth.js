import jwt from 'jsonwebtoken';
import { Person } from '../models/index.js';

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const person = await Person.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!person || !person.is_active || person.deleted_at) {
      return res.status(401).json({ error: 'Invalid or inactive account' });
    }

    req.user = person;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...types) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!types.includes(req.user.person_type)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Internal service-to-service auth via shared secret
export const serviceAuth = (req, res, next) => {
  const serviceKey = req.headers['x-service-key'];
  if (serviceKey && serviceKey === process.env.INTERNAL_SERVICE_KEY) {
    req.isServiceCall = true;
    return next();
  }
  // Fall through to normal auth
  return authenticate(req, res, next);
};
