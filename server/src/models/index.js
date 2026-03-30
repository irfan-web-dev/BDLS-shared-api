import sequelize from '../config/database.js';
import Campus from './Campus.js';
import Person from './Person.js';
import ClassLevel from './ClassLevel.js';
import Section from './Section.js';
import Subject from './Subject.js';
import Enrollment from './Enrollment.js';

// Campus associations
Campus.hasMany(Person, { foreignKey: 'campus_id', as: 'people' });
Person.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus' });

Campus.hasMany(ClassLevel, { foreignKey: 'campus_id', as: 'classes' });
ClassLevel.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus' });

Campus.hasMany(Section, { foreignKey: 'campus_id', as: 'sections' });
Section.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus' });

// Class associations
ClassLevel.hasMany(Section, { foreignKey: 'class_id', as: 'sections' });
Section.belongsTo(ClassLevel, { foreignKey: 'class_id', as: 'classLevel' });

ClassLevel.hasMany(Subject, { foreignKey: 'class_id', as: 'subjects' });
Subject.belongsTo(ClassLevel, { foreignKey: 'class_id', as: 'classLevel' });

// Parent-child association
Person.hasMany(Person, { foreignKey: 'parent_id', as: 'children' });
Person.belongsTo(Person, { foreignKey: 'parent_id', as: 'parent' });

// Enrollment associations
Person.hasMany(Enrollment, { foreignKey: 'student_id', as: 'enrollments' });
Enrollment.belongsTo(Person, { foreignKey: 'student_id', as: 'student' });

ClassLevel.hasMany(Enrollment, { foreignKey: 'class_id', as: 'enrollments' });
Enrollment.belongsTo(ClassLevel, { foreignKey: 'class_id', as: 'classLevel' });

Section.hasMany(Enrollment, { foreignKey: 'section_id', as: 'enrollments' });
Enrollment.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });

export {
  sequelize,
  Campus,
  Person,
  ClassLevel,
  Section,
  Subject,
  Enrollment,
};
