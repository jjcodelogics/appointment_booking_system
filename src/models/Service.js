export default (sequelize, DataTypes) => {
    // Renamed to 'Service' for PascalCase consistency with other models
    const Service = sequelize.define('Service', {
        service_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        // Renamed 'man_female' to 'gender_target' for clarity
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
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
    }, {
        tableName: 'services',
        timestamps: false,
    });

    // Define associations (Relationships)
    Service.associate = (models) => {
        Service.hasMany(models.Appointment, { foreignKey: 'service_id' });
    };

    return Service;
}
