import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Person = sequelize.define('Person', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cnic: {
    type: DataTypes.STRING(15),
    allowNull: true,
    unique: true,
  },
  person_type: {
    type: DataTypes.ENUM('super_admin', 'campus_admin', 'staff', 'branch_staff', 'teacher', 'student', 'parent'),
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  campus_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  relationship: {
    type: DataTypes.ENUM('father', 'mother', 'guardian', 'other'),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'people',
  underscored: true,
});

export default Person;
