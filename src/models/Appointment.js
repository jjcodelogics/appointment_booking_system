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
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      unique: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'confirmed',
      allowNull: false,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    staff_assigned: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });

  // Associations - called from models/index after all models are loaded
  Appointment.associate = (models) => {
    Appointment.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });

    if (models.Service) {
      Appointment.belongsTo(models.Service, { foreignKey: 'service_id', as: 'Service' });
    }
  };

  // return the model instance so index.js registers it
  return Appointment;
};