import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Person, Campus } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/v1/auth/login - Unified login for all systems
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    // Find by email or username
    const where = { deleted_at: null };
    if (email) {
      where.email = email;
    } else {
      where.username = username;
    }

    const person = await Person.findOne({
      where,
      include: [{ model: Campus, as: 'campus' }],
    });

    if (!person) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!person.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    const valid = await bcrypt.compare(password, person.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: person.id, type: person.person_type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await person.update({ last_login_at: new Date() });

    const data = person.toJSON();
    delete data.password;

    res.json({ token, user: data });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/v1/auth/validate - Validate token (for CRM/LMS to verify)
router.post('/validate', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const person = await Person.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Campus, as: 'campus' }],
    });

    if (!person || !person.is_active || person.deleted_at) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ valid: true, user: person });
  } catch {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/v1/auth/change-password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const person = await Person.findByPk(req.user.id);
    const valid = await bcrypt.compare(currentPassword, person.password);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await person.update({ password: hashed, version: person.version + 1 });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
