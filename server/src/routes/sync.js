import { Router } from 'express';
import { Op } from 'sequelize';
import { Person, ClassLevel, Section, Subject, Campus, Enrollment } from '../models/index.js';
import { serviceAuth } from '../middleware/auth.js';

const router = Router();

router.use(serviceAuth);

// GET /api/v1/sync - Incremental sync endpoint
// Query params: after (ISO timestamp), types (comma-separated: people,classes,subjects,etc)
router.get('/', async (req, res) => {
  try {
    const { after, types } = req.query;
    const since = after ? new Date(after) : new Date(0);
    const requestedTypes = types ? types.split(',') : ['people', 'classes', 'sections', 'subjects', 'campuses', 'enrollments'];

    const result = {};

    if (requestedTypes.includes('people')) {
      result.people = await Person.findAll({
        where: { updated_at: { [Op.gt]: since } },
        attributes: { exclude: ['password'] },
        order: [['updated_at', 'ASC']],
      });
    }

    if (requestedTypes.includes('classes')) {
      result.classes = await ClassLevel.findAll({
        where: { updated_at: { [Op.gt]: since } },
        order: [['sort_order', 'ASC']],
      });
    }

    if (requestedTypes.includes('sections')) {
      result.sections = await Section.findAll({
        where: { updated_at: { [Op.gt]: since } },
        order: [['name', 'ASC']],
      });
    }

    if (requestedTypes.includes('subjects')) {
      result.subjects = await Subject.findAll({
        where: { updated_at: { [Op.gt]: since } },
        order: [['name', 'ASC']],
      });
    }

    if (requestedTypes.includes('campuses')) {
      result.campuses = await Campus.findAll({
        where: { updated_at: { [Op.gt]: since } },
        order: [['name', 'ASC']],
      });
    }

    if (requestedTypes.includes('enrollments')) {
      result.enrollments = await Enrollment.findAll({
        where: { updated_at: { [Op.gt]: since } },
        order: [['updated_at', 'ASC']],
      });
    }

    result.sync_timestamp = new Date().toISOString();

    res.json(result);
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/sync/full - Full data dump (for initial cache population)
router.get('/full', async (req, res) => {
  try {
    const { types } = req.query;
    const requestedTypes = types ? types.split(',') : ['people', 'classes', 'sections', 'subjects', 'campuses'];

    const result = {};

    if (requestedTypes.includes('people')) {
      result.people = await Person.findAll({
        where: { deleted_at: null, is_active: true },
        attributes: { exclude: ['password'] },
        order: [['name', 'ASC']],
      });
    }

    if (requestedTypes.includes('classes')) {
      result.classes = await ClassLevel.findAll({
        where: { is_active: true },
        order: [['sort_order', 'ASC']],
      });
    }

    if (requestedTypes.includes('sections')) {
      result.sections = await Section.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']],
      });
    }

    if (requestedTypes.includes('subjects')) {
      result.subjects = await Subject.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']],
      });
    }

    if (requestedTypes.includes('campuses')) {
      result.campuses = await Campus.findAll({
        where: { deleted_at: null, is_active: true },
        order: [['name', 'ASC']],
      });
    }

    result.sync_timestamp = new Date().toISOString();

    res.json(result);
  } catch (error) {
    console.error('Full sync error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
