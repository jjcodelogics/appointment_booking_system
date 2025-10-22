export default (sequelize, DataTypes) => {
    // Renamed to 'Service' for PascalCase consistency with other models
    const Service = sequelize.define('Service', {
        service_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        gender_target: {
            type: DataTypes.ENUM('male', 'female'),
            allowNull: false,
        },
        washing: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        cutting: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        coloring: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        tableName: 'services',
    });
        

    // Define associations (Relationships)
    Service.associate = (models) => {
        Service.hasMany(models.Appointment, { foreignKey: 'service_id' });
    };

    return Service;
}
