export default (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    appointment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    //time_slot: {
      //type: DataTypes.STRING,
      //allowNull: false,
    //},
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'appointments',
    timestamps: false,
  });

  // Associations - called from models/index after all models are loaded
  Appointment.associate = (models) => {
    Appointment.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
    if (models.Employee) {
      Appointment.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'Employee' });
    }
    if (models.Service) {
      Appointment.belongsTo(models.Service, { foreignKey: 'service_id', as: 'Service' });
    }
  };

  // return the model instance so index.js registers it
  return Appointment;
};