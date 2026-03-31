import { Router } from 'express';
import { Enrollment, Person, ClassLevel, Section } from '../models/index.js';
import { serviceAuth } from '../middleware/auth.js';

const router = Router();

router.use(serviceAuth);

// GET /api/v1/enrollments - List with filters
router.get('/', async (req, res) => {
  try {
    const { student_id, class_id, section_id, academic_year, status } = req.query;
    const where = {};

    if (student_id) where.student_id = student_id;
    if (class_id) where.class_id = class_id;
    if (section_id) where.section_id = section_id;
    if (academic_year) where.academic_year = academic_year;
    if (status) where.status = status;

    const enrollments = await Enrollment.findAll({
      where,
      include: [
        { model: Person, as: 'student', attributes: ['id', 'name', 'email', 'phone'] },
        { model: ClassLevel, as: 'classLevel' },
        { model: Section, as: 'section' },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(enrollments);
  } catch (error) {
    console.error('List enrollments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/enrollments/:id
router.get('/:id', async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id, {
      include: [
        { model: Person, as: 'student', attributes: ['id', 'name', 'email', 'phone', 'campus_id'] },
        { model: ClassLevel, as: 'classLevel' },
        { model: Section, as: 'section' },
      ],
    });

    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/v1/enrollments
router.post('/', async (req, res) => {
  try {
    const { student_id, class_id, section_id, academic_year, status, enrolled_date } = req.body;

    if (!student_id || !class_id || !academic_year) {
      return res.status(400).json({ error: 'student_id, class_id, and academic_year are required' });
    }

    // Check student exists
    const student = await Person.findOne({
      where: { id: student_id, person_type: 'student', deleted_at: null },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Check duplicate enrollment
    const existing = await Enrollment.findOne({
      where: { student_id, academic_year },
    });
    if (existing) {
      return res.status(409).json({ error: 'Student already enrolled for this academic year', existing_id: existing.id });
    }

    const enrollment = await Enrollment.create({
      student_id,
      class_id,
      section_id: section_id || null,
      academic_year,
      status: status || 'active',
      enrolled_date: enrolled_date || new Date(),
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/v1/enrollments/:id
router.put('/:id', async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    const { class_id, section_id, status, academic_year } = req.body;

    await enrollment.update({
      class_id: class_id || enrollment.class_id,
      section_id: section_id !== undefined ? section_id : enrollment.section_id,
      status: status || enrollment.status,
      academic_year: academic_year || enrollment.academic_year,
    });

    res.json(enrollment);
  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/v1/enrollments/:id
router.delete('/:id', async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    await enrollment.update({ status: 'withdrawn' });
    res.json({ message: 'Enrollment withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
