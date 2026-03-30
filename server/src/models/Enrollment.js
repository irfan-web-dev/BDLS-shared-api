import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  section_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  academic_year: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'transferred', 'graduated', 'withdrawn'),
    defaultValue: 'active',
  },
  enrolled_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'enrollments',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'academic_year'],
    },
  ],
});

export default Enrollment;
