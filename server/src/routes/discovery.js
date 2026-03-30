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
        sections: 'GET /api/v1/classes/:id/sections',
        subjects: 'GET /api/v1/classes/:id/subjects',
      },
      campuses: {
        list: 'GET /api/v1/campuses',
        get: 'GET /api/v1/campuses/:id',
        create: 'POST /api/v1/campuses',
        update: 'PUT /api/v1/campuses/:id',
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
