import { Router } from 'express';

const router = Router();

// GET /api/v1/discovery - API discovery endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Bab-e-Arqam Shared API',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/v1/auth/login',
        validate: 'POST /api/v1/auth/validate',
        me: 'GET /api/v1/auth/me',
        changePassword: 'PUT /api/v1/auth/change-password',
      },
      people: {
        list: 'GET /api/v1/people?type=&campus_id=&search=',
        get: 'GET /api/v1/people/:id',
        create: 'POST /api/v1/people',
        update: 'PUT /api/v1/people/:id',
        delete: 'DELETE /api/v1/people/:id',
        admit: 'POST /api/v1/people/admit',
      },
      classes: {
        list: 'GET /api/v1/classes',
        get: 'GET /api/v1/classes/:id',
        create: 'POST /api/v1/classes',
        update: 'PUT /api/v1/classes/:id',
        delete: 'DELETE /api/v1/classes/:id',
        listSections: 'GET /api/v1/classes/:id/sections',
        createSection: 'POST /api/v1/classes/:id/sections',
        updateSection: 'PUT /api/v1/classes/:classId/sections/:id',
        deleteSection: 'DELETE /api/v1/classes/:classId/sections/:id',
        listSubjects: 'GET /api/v1/classes/:id/subjects',
        createSubject: 'POST /api/v1/classes/:id/subjects',
        updateSubject: 'PUT /api/v1/classes/:classId/subjects/:id',
        deleteSubject: 'DELETE /api/v1/classes/:classId/subjects/:id',
      },
      campuses: {
        list: 'GET /api/v1/campuses',
        get: 'GET /api/v1/campuses/:id',
        create: 'POST /api/v1/campuses',
        update: 'PUT /api/v1/campuses/:id',
        delete: 'DELETE /api/v1/campuses/:id',
      },
      enrollments: {
        list: 'GET /api/v1/enrollments?student_id=&class_id=&academic_year=&status=',
        get: 'GET /api/v1/enrollments/:id',
        create: 'POST /api/v1/enrollments',
        update: 'PUT /api/v1/enrollments/:id',
        delete: 'DELETE /api/v1/enrollments/:id',
      },
      sync: {
        incremental: 'GET /api/v1/sync?after=ISO_TIMESTAMP&types=people,classes',
        full: 'GET /api/v1/sync/full?types=people,classes',
      },
    },
    person_types: ['super_admin', 'campus_admin', 'staff', 'branch_staff', 'teacher', 'student', 'parent'],
  });
});

export default router;
