module.exports = (sequelize, DataTypes) => {
  // Renamed to 'Employee' for PascalCase consistency with other models
  const Employee = sequelize.define('Employee', { 
    employee_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weekly_hours: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'staff', 'manager'),
      allowNull: false,
      defaultValue: 'staff',
    },
  }, {
    tableName: 'employees',
    timestamps: false,
  });

  // Define associations (Relationships)
  Employee.associate = (models) => {
    Employee.hasMany(models.Appointment, { foreignKey: 'employee_id' });
  };

  return Employee;
}
