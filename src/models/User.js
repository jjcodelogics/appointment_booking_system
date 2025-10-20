import { genSalt, hash, compare } from 'bcrypt';
import { z } from 'zod';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user',
    },
  }, {
    tableName: 'users',
    timestamps: false,
  });

  // Hook to hash password before saving a new user or updating an existing user's password
  // This removes the need to hash manually in the /register route.
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await genSalt(10); 
      user.password = await hash(user.password, salt);
    }
  });


  User.prototype.validPassword = async function (password) {
    // bcrypt.compare safely compares a plaintext string to a stored hash
    return await compare(password, this.password);
  };

  // Define associations (Relationships)
  User.associate = (models) => {
    User.hasMany(models.Appointment, { foreignKey: 'user_id', as: 'Appointments' });
  };

  return User;
};