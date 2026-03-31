import { Router } from 'express';
import { ClassLevel, Section, Subject, Campus } from '../models/index.js';
import { serviceAuth } from '../middleware/auth.js';

const router = Router();

router.use(serviceAuth);

// GET /api/v1/classes
router.get('/', async (req, res) => {
  try {
    const where = { is_active: true };
    if (req.query.campus_id) where.campus_id = req.query.campus_id;

    const classes = await ClassLevel.findAll({
      where,
      include: [
        { model: Section, as: 'sections', where: { is_active: true }, required: false },
        { model: Subject, as: 'subjects', where: { is_active: true }, required: false },
      ],
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    });

    res.json(classes);
  } catch (error) {
    console.error('List classes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/classes/:id
router.get('/:id', async (req, res) => {
  try {
    const cls = await ClassLevel.findByPk(req.params.id, {
      include: [
        { model: Section, as: 'sections' },
        { model: Subject, as: 'subjects' },
      ],
    });
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(cls);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/v1/classes
router.post('/', async (req, res) => {
  try {
    const { name, campus_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    // Duplicate check
    const existing = await ClassLevel.findOne({ where: { name, campus_id: campus_id || null } });
    if (existing) return res.json(existing);

    const maxOrder = await ClassLevel.max('sort_order', {
      where: campus_id ? { campus_id } : {},
    }) || 0;

    const cls = await ClassLevel.create({
      name,
      campus_id: campus_id || null,
      sort_order: maxOrder + 1,
    });

    res.status(201).json(cls);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/v1/classes/:id
router.put('/:id', async (req, res) => {
  try {
    const cls = await ClassLevel.findByPk(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const { name, sort_order, is_active, campus_id } = req.body;
    await cls.update({
      name: name || cls.name,
      sort_order: sort_order !== undefined ? sort_order : cls.sort_order,
      is_active: is_active !== undefined ? is_active : cls.is_active,
      campus_id: campus_id !== undefined ? campus_id : cls.campus_id,
    });

    res.json(cls);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/v1/classes/:id (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const cls = await ClassLevel.findByPk(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    await cls.update({ is_active: false });
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Sections ───

// GET /api/v1/classes/:id/sections
router.get('/:id/sections', async (req, res) => {
  try {
    const sections = await Section.findAll({
      where: { class_id: req.params.id, is_active: true },
      order: [['name', 'ASC']],
    });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/v1/classes/:id/sections
router.post('/:id/sections', async (req, res) => {
  try {
    const { name, campus_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const section = await Section.create({
      name,
      class_id: parseInt(req.params.id),
      campus_id: campus_id || null,
    });

    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/v1/classes/:classId/sections/:id
router.put('/:classId/sections/:id', async (req, res) => {
  try {
    const section = await Section.findOne({
      where: { id: req.params.id, class_id: req.params.classId },
    });
    if (!section) return res.status(404).json({ error: 'Section not found' });

    const { name, campus_id, is_active } = req.body;
    await section.update({
      name: name || section.name,
      campus_id: campus_id !== undefined ? campus_id : section.campus_id,
      is_active: is_active !== undefined ? is_active : section.is_active,
    });

    res.json(section);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/v1/classes/:classId/sections/:id (soft delete)
router.delete('/:classId/sections/:id', async (req, res) => {
  try {
    const section = await Section.findOne({
      where: { id: req.params.id, class_id: req.params.classId },
    });
    if (!section) return res.status(404).json({ error: 'Section not found' });

    await section.update({ is_active: false });
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Subjects ───

// GET /api/v1/classes/:id/subjects
router.get('/:id/subjects', async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      where: { class_id: req.params.id, is_active: true },
      order: [['name', 'ASC']],
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/v1/classes/:id/subjects
router.post('/:id/subjects', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    // Duplicate check
    const existing = await Subject.findOne({
      where: { name, class_id: req.params.id },
    });
    if (existing) return res.json(existing);

    const subject = await Subject.create({
      name,
      class_id: parseInt(req.params.id),
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/v1/classes/:classId/subjects/:id
router.put('/:classId/subjects/:id', async (req, res) => {
  try {
    const subject = await Subject.findOne({
      where: { id: req.params.id, class_id: req.params.classId },
    });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    const { name, is_active } = req.body;
    await subject.update({
      name: name || subject.name,
      is_active: is_active !== undefined ? is_active : subject.is_active,
    });

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/v1/classes/:classId/subjects/:id (soft delete)
router.delete('/:classId/subjects/:id', async (req, res) => {
  try {
    const subject = await Subject.findOne({
      where: { id: req.params.id, class_id: req.params.classId },
    });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    await subject.update({ is_active: false });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
