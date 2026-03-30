import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { sequelize, Campus, Person, ClassLevel, Subject } from './models/index.js';

const classSubjects = {
  'Play Group': ['English', 'Urdu', 'Mathematics', 'Nazra Quran'],
  'Nursery': ['English', 'Urdu', 'Mathematics', 'Nazra Quran'],
  'KG': ['English', 'Urdu', 'Mathematics', 'Nazra Quran'],
  'Class 1': ['English', 'Urdu', 'Mathematics', 'Islamiat', 'Nazra Quran'],
  'Class 2': ['English', 'Urdu', 'Mathematics', 'Islamiat', 'Nazra Quran'],
  'Class 3': ['English', 'Urdu', 'Mathematics', 'Islamiat', 'General Science', 'Social Studies'],
  'Class 4': ['English', 'Urdu', 'Mathematics', 'Islamiat', 'General Science', 'Social Studies'],
  'Class 5': ['English', 'Urdu', 'Mathematics', 'Islamiat', 'General Science', 'Social Studies'],
  'Class 6': ['English', 'Urdu', 'Mathematics', 'Islamiat', 'Science', 'Social Studies', 'Computer Science'],
  'Class 7': ['English', 'Urdu', 'Mathematics', 'Islamiat', 'Science', 'Social Studies', 'Computer Science'],
  'Class 8': ['English', 'Urdu', 'Mathematics', 'Islamiat', 'Science', 'Social Studies', 'Computer Science'],
  'Class 9': ['English', 'Urdu', 'Mathematics', 'Islamiat', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
  'Class 10': ['English', 'Urdu', 'Mathematics', 'Islamiat', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
};

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to Shared DB.');

    // Check if already seeded
    const campusCount = await Campus.count();
    if (campusCount > 0) {
      console.log('Shared data already seeded, skipping.');
      process.exit(0);
    }

    // Create campuses
    const mainCampus = await Campus.create({
      name: 'Main Campus',
      address: '123 Main Street, City Center',
      phone: '0300-1234567',
    });

    const branchCampus = await Campus.create({
      name: 'Branch Campus',
      address: '456 Branch Road, Suburb Area',
      phone: '0300-7654321',
    });

    console.log('Campuses created.');

    // Create users (all roles)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const teacherPassword = await bcrypt.hash('password123', 10);

    await Person.create({
      name: 'Super Admin',
      email: 'admin@school.com',
      password: hashedPassword,
      person_type: 'super_admin',
      phone: '0300-0000001',
    });

    await Person.create({
      name: 'Campus Admin',
      email: 'campusadmin@school.com',
      password: hashedPassword,
      person_type: 'campus_admin',
      campus_id: mainCampus.id,
      phone: '0300-0000002',
    });

    await Person.create({
      name: 'Staff Member',
      email: 'staff@school.com',
      password: hashedPassword,
      person_type: 'staff',
      campus_id: mainCampus.id,
      phone: '0300-0000003',
    });

    await Person.create({
      name: 'Branch Staff',
      email: 'branchstaff@school.com',
      password: hashedPassword,
      person_type: 'branch_staff',
      campus_id: branchCampus.id,
      phone: '0300-0000004',
    });

    // Create default teacher (matches LMS seed)
    await Person.create({
      name: 'Default Teacher',
      email: 'teacher@school.com',
      username: 'teacher',
      password: teacherPassword,
      person_type: 'teacher',
      campus_id: mainCampus.id,
    });

    console.log('Users created.');

    // Create classes and subjects
    let sortOrder = 1;
    for (const [className, subjects] of Object.entries(classSubjects)) {
      const cls = await ClassLevel.create({
        name: className,
        sort_order: sortOrder++,
        campus_id: mainCampus.id,
      });
      for (const subjectName of subjects) {
        await Subject.create({ name: subjectName, class_id: cls.id });
      }
    }

    console.log('Classes and subjects created.');

    console.log('\n=== Shared DB Seed Complete ===');
    console.log('Login credentials:');
    console.log('  Super Admin:  admin@school.com / admin123');
    console.log('  Campus Admin: campusadmin@school.com / admin123');
    console.log('  Staff:        staff@school.com / admin123');
    console.log('  Branch Staff: branchstaff@school.com / admin123');
    console.log('  Teacher:      teacher@school.com (or username: teacher) / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
