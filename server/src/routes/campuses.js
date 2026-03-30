import { Router } from 'express';
import { Campus } from '../models/index.js';
import { serviceAuth } from '../middleware/auth.js';

const router = Router();

router.use(serviceAuth);

// GET /api/v1/campuses
router.get('/', async (req, res) => {
  try {
    const where = { deleted_at: null };
    if (req.query.is_active !== undefined) {
      where.is_active = req.query.is_active === 'true';
    }

    const campuses = await Campus.findAll({
      where,
      order: [['name', 'ASC']],
    });

    res.json(campuses);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/campuses/:id
router.get('/:id', async (req, res) => {
  try {
    const campus = await Campus.findOne({
      where: { id: req.params.id, deleted_at: null },
    });
    if (!campus) return res.status(404).json({ error: 'Campus not found' });
    res.json(campus);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/v1/campuses
router.post('/', async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const campus = await Campus.create({ name, address, phone });
    res.status(201).json(campus);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/v1/campuses/:id
router.put('/:id', async (req, res) => {
  try {
    const campus = await Campus.findOne({ where: { id: req.params.id, deleted_at: null } });
    if (!campus) return res.status(404).json({ error: 'Campus not found' });

    const { name, address, phone, is_active } = req.body;
    await campus.update({
      name: name || campus.name,
      address: address !== undefined ? address : campus.address,
      phone: phone !== undefined ? phone : campus.phone,
      is_active: is_active !== undefined ? is_active : campus.is_active,
    });

    res.json(campus);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/v1/campuses/:id (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const campus = await Campus.findOne({ where: { id: req.params.id, deleted_at: null } });
    if (!campus) return res.status(404).json({ error: 'Campus not found' });

    await campus.update({ deleted_at: new Date(), is_active: false });
    res.json({ message: 'Campus deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
