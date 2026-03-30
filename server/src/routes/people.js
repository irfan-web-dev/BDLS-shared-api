import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { Person, Campus, Enrollment, ClassLevel, Section, sequelize } from '../models/index.js';
import { serviceAuth, authorize } from '../middleware/auth.js';

const router = Router();

router.use(serviceAuth);

// GET /api/v1/people - List people with filters
router.get('/', async (req, res) => {
  try {
    const { type, campus_id, is_active, search, class_id } = req.query;
    const where = { deleted_at: null };

    if (type) where.person_type = type;
    if (campus_id) where.campus_id = campus_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const include = [{ model: Campus, as: 'campus' }];

    // If filtering by class, join enrollments
    if (class_id) {
      include.push({
        model: Enrollment,
        as: 'enrollments',
        where: { class_id, status: 'active' },
        required: true,
        include: [
          { model: ClassLevel, as: 'classLevel' },
          { model: Section, as: 'section' },
        ],
      });
    }

    const people = await Person.findAll({
      where,
      attributes: { exclude: ['password'] },
      include,
      order: [['name', 'ASC']],
    });

    res.json(people);
  } catch (error) {
    console.error('List people error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/people/:id
router.get('/:id', async (req, res) => {
  try {
    const person = await Person.findOne({
      where: { id: req.params.id, deleted_at: null },
      attributes: { exclude: ['password'] },
      include: [
        { model: Campus, as: 'campus' },
        { model: Person, as: 'parent', attributes: ['id', 'name', 'phone', 'email'] },
        { model: Person, as: 'children', attributes: ['id', 'name', 'person_type'] },
        {
          model: Enrollment,
          as: 'enrollments',
          include: [
            { model: ClassLevel, as: 'classLevel' },
            { model: Section, as: 'section' },
          ],
        },
      ],
    });

    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json(person);
  } catch (error) {
    console.error('Get person error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/v1/people - Create a person (teacher, staff, etc.)
router.post('/', async (req, res) => {
  try {
    const { name, email, username, phone, password, person_type, campus_id,
            gender, date_of_birth, address, cnic, parent_id, relationship } = req.body;

    if (!name || !person_type) {
      return res.status(400).json({ error: 'Name and person_type are required' });
    }

    // Duplicate check by email or username
    if (email) {
      const existing = await Person.findOne({ where: { email, deleted_at: null } });
      if (existing) {
        return res.status(409).json({ error: 'Email already exists', existing_id: existing.id });
      }
    }
    if (username) {
      const existing = await Person.findOne({ where: { username, deleted_at: null } });
      if (existing) {
        return res.status(409).json({ error: 'Username already exists', existing_id: existing.id });
      }
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const person = await Person.create({
      name,
      email: email || null,
      username: username || null,
      phone: phone || null,
      password: hashedPassword,
      person_type,
      campus_id: campus_id || null,
      gender: gender || null,
      date_of_birth: date_of_birth || null,
      address: address || null,
      cnic: cnic || null,
      parent_id: parent_id || null,
      relationship: relationship || null,
    });

    const data = person.toJSON();
    delete data.password;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create person error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/v1/people/:id
router.put('/:id', async (req, res) => {
  try {
    const person = await Person.findOne({ where: { id: req.params.id, deleted_at: null } });
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Version check for concurrent updates
    if (req.body.version !== undefined && req.body.version !== person.version) {
      return res.status(409).json({
        error: 'Record has been modified by another user. Please refresh and try again.',
        current_version: person.version,
      });
    }

    const { name, email, username, phone, person_type, campus_id,
            gender, date_of_birth, address, cnic, is_active,
            parent_id, relationship } = req.body;

    // Check email uniqueness if changing
    if (email && email !== person.email) {
      const existing = await Person.findOne({ where: { email, deleted_at: null } });
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    await person.update({
      name: name || person.name,
      email: email !== undefined ? email : person.email,
      username: username !== undefined ? username : person.username,
      phone: phone !== undefined ? phone : person.phone,
      person_type: person_type || person.person_type,
      campus_id: campus_id !== undefined ? campus_id : person.campus_id,
      gender: gender !== undefined ? gender : person.gender,
      date_of_birth: date_of_birth !== undefined ? date_of_birth : person.date_of_birth,
      address: address !== undefined ? address : person.address,
      cnic: cnic !== undefined ? cnic : person.cnic,
      is_active: is_active !== undefined ? is_active : person.is_active,
      parent_id: parent_id !== undefined ? parent_id : person.parent_id,
      relationship: relationship !== undefined ? relationship : person.relationship,
      version: person.version + 1,
    });

    const data = person.toJSON();
    delete data.password;
    res.json(data);
  } catch (error) {
    console.error('Update person error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/v1/people/:id (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const person = await Person.findOne({ where: { id: req.params.id, deleted_at: null } });
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    await person.update({ deleted_at: new Date(), is_active: false });
    res.json({ message: 'Person deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/v1/people/admit - Admission flow (transactional)
router.post('/admit', async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { student_name, date_of_birth, gender, class_id, section_id,
            campus_id, academic_year, parent_name, parent_phone,
            parent_email, relationship, parent_cnic } = req.body;

    if (!student_name || !class_id || !parent_name) {
      await t.rollback();
      return res.status(400).json({ error: 'student_name, class_id, and parent_name are required' });
    }

    const year = academic_year || `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(2)}`;

    // 1. Find or create parent
    let parent;
    if (parent_phone) {
      parent = await Person.findOne({
        where: { phone: parent_phone, person_type: 'parent', deleted_at: null },
        transaction: t,
      });
    }

    if (!parent) {
      parent = await Person.create({
        name: parent_name,
        phone: parent_phone || null,
        email: parent_email || null,
        cnic: parent_cnic || null,
        person_type: 'parent',
        campus_id: campus_id || null,
        relationship: relationship || 'father',
      }, { transaction: t });
    }

    // 2. Create student with default credentials
    const studentEmail = `student.${Date.now()}@school.local`;
    const defaultPassword = await bcrypt.hash('student123', 10);

    const student = await Person.create({
      name: student_name,
      email: studentEmail,
      password: defaultPassword,
      person_type: 'student',
      gender: gender || null,
      date_of_birth: date_of_birth || null,
      campus_id: campus_id || null,
      parent_id: parent.id,
      relationship: relationship || 'father',
    }, { transaction: t });

    // 3. Create enrollment
    const enrollment = await Enrollment.create({
      student_id: student.id,
      class_id,
      section_id: section_id || null,
      academic_year: year,
      status: 'active',
      enrolled_date: new Date(),
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      student: { id: student.id, name: student.name, email: studentEmail },
      parent: { id: parent.id, name: parent.name },
      enrollment: { id: enrollment.id, class_id, academic_year: year },
      default_credentials: {
        email: studentEmail,
        password: 'student123',
      },
    });
  } catch (error) {
    await t.rollback();
    console.error('Admission error:', error);
    res.status(500).json({ error: 'Admission failed. No data was saved.' });
  }
});

export default router;
