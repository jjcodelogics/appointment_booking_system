'use strict';

import { readdirSync } from 'fs';
import { basename as _basename, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import { env as _env } from 'process';

// Recreate __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically import the CJS config file
const configPath = join(__dirname, '..', '..', 'config', 'config.js');
const configModule = await import(`file://${configPath}`);
const config = configModule[_env.NODE_ENV || 'development'];


const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);

sequelize
  .authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch((err) => console.error('Unable to connect to the database:', err));

const db = { sequelize, Sequelize };

// Wrap the dynamic import in an async function
const initializeModels = async () => {
  const files = readdirSync(__dirname).filter((file) => {
    return file.indexOf('.') !== 0 && file !== _basename(__filename) && file.slice(-3) === '.js';
  });

  for (const file of files) {
    const filePath = join(__dirname, file);
    const modelDefinition = (await import(`file://${filePath}`)).default;
    const model = modelDefinition(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  }

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  console.log('Models initialized successfully.');
};

export { initializeModels };
export default db;