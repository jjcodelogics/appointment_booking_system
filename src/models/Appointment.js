module.exports = (sequelize, DataTypes) => {
    const Appointment = sequelize.define('Appointment', {
        // --- All your fields go inside this object ---
        appointment_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        appointment_date: { 
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('scheduled', 'completed', 'canceled'),
            allowNull: false,
            defaultValue: 'scheduled',
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        service_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            foreignKey: true,
        },
        employee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            foreignKey: true,
        },
        // CORRECT: The new field is placed here, with the other columns.
        reminder_sent: { 
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        }
    }, {
        tableName: 'appointments',
        timestamps: false,
    });

    Appointment.associate = (models) => {
        Appointment.belongsTo(models.User, { foreignKey: 'user_id' });
        Appointment.belongsTo(models.Service, { foreignKey: 'service_id' });
        Appointment.belongsTo(models.Employee, { foreignKey: 'employee_id' });
    };

    return Appointment;
}