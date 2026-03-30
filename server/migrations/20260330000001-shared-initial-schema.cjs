'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ─── Campuses ───
    const campusesExists = await queryInterface.showAllTables().then(t => t.includes('campuses'));
    if (!campusesExists) {
      await queryInterface.createTable('campuses', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: false },
        address: { type: Sequelize.TEXT, allowNull: true },
        phone: { type: Sequelize.STRING, allowNull: true },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      });
    }

    // ─── People (unified users/teachers/students/parents) ───
    const peopleExists = await queryInterface.showAllTables().then(t => t.includes('people'));
    if (!peopleExists) {
      await queryInterface.createTable('people', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: false },
        email: { type: Sequelize.STRING, allowNull: true, unique: true },
        username: { type: Sequelize.STRING, allowNull: true, unique: true },
        phone: { type: Sequelize.STRING, allowNull: true },
        password: { type: Sequelize.STRING, allowNull: true },
        cnic: { type: Sequelize.STRING(15), allowNull: true, unique: true },
        person_type: {
          type: Sequelize.ENUM('super_admin', 'campus_admin', 'staff', 'branch_staff', 'teacher', 'student', 'parent'),
          allowNull: false,
        },
        gender: { type: Sequelize.ENUM('male', 'female', 'other'), allowNull: true },
        date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
        address: { type: Sequelize.TEXT, allowNull: true },
        campus_id: {
          type: Sequelize.INTEGER, allowNull: true,
          references: { model: 'campuses', key: 'id' },
        },
        parent_id: {
          type: Sequelize.INTEGER, allowNull: true,
          references: { model: 'people', key: 'id' },
        },
        relationship: { type: Sequelize.ENUM('father', 'mother', 'guardian', 'other'), allowNull: true },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
        last_login_at: { type: Sequelize.DATE, allowNull: true },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
        version: { type: Sequelize.INTEGER, defaultValue: 1 },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      });
    }

    // ─── Classes ───
    const classesExists = await queryInterface.showAllTables().then(t => t.includes('classes'));
    if (!classesExists) {
      await queryInterface.createTable('classes', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: false },
        sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
        campus_id: {
          type: Sequelize.INTEGER, allowNull: true,
          references: { model: 'campuses', key: 'id' },
        },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      });
    }

    // ─── Sections ───
    const sectionsExists = await queryInterface.showAllTables().then(t => t.includes('sections'));
    if (!sectionsExists) {
      await queryInterface.createTable('sections', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: false },
        class_id: {
          type: Sequelize.INTEGER, allowNull: false,
          references: { model: 'classes', key: 'id' },
        },
        campus_id: {
          type: Sequelize.INTEGER, allowNull: true,
          references: { model: 'campuses', key: 'id' },
        },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      });
    }

    // ─── Subjects ───
    const subjectsExists = await queryInterface.showAllTables().then(t => t.includes('subjects'));
    if (!subjectsExists) {
      await queryInterface.createTable('subjects', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: false },
        class_id: {
          type: Sequelize.INTEGER, allowNull: false,
          references: { model: 'classes', key: 'id' },
        },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      });
    }

    // ─── Enrollments ───
    const enrollmentsExists = await queryInterface.showAllTables().then(t => t.includes('enrollments'));
    if (!enrollmentsExists) {
      await queryInterface.createTable('enrollments', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        student_id: {
          type: Sequelize.INTEGER, allowNull: false,
          references: { model: 'people', key: 'id' },
        },
        class_id: {
          type: Sequelize.INTEGER, allowNull: false,
          references: { model: 'classes', key: 'id' },
        },
        section_id: {
          type: Sequelize.INTEGER, allowNull: true,
          references: { model: 'sections', key: 'id' },
        },
        academic_year: { type: Sequelize.STRING(10), allowNull: false },
        status: {
          type: Sequelize.ENUM('active', 'transferred', 'graduated', 'withdrawn'),
          defaultValue: 'active',
        },
        enrolled_date: { type: Sequelize.DATEONLY, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      });

      await queryInterface.addIndex('enrollments', ['student_id', 'academic_year'], {
        unique: true,
        name: 'enrollments_student_year_unique',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('enrollments');
    await queryInterface.dropTable('subjects');
    await queryInterface.dropTable('sections');
    await queryInterface.dropTable('classes');
    await queryInterface.dropTable('people');
    await queryInterface.dropTable('campuses');
  },
};
