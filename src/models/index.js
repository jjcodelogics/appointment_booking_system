'use strict';

import { readdirSync } from 'fs';
import { basename as _basename, join, dirname } from 'path'; // <-- Import dirname
import { fileURLToPath } from 'url'; // <-- Import url helpers
import Sequelize, { DataTypes } from 'sequelize';
import { env as _env } from 'process';

// --- FIX 1: Recreate __filename and __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- FIX 2: Dynamically import the CJS config file ---
// This assumes your config/config.js is a CommonJS file.
const configPath = join(__dirname, '..', '..', 'config', 'config.js');
const configModule = await import(`file://${configPath}`);
const config = configModule[_env.NODE_ENV || 'development'];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(_env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// --- FIX 3: Use dynamic import() for model files ---
const files = readdirSync(__dirname).filter(file => {
  return (
    file.indexOf('.') !== 0 &&
    file !== _basename(__filename) &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  );
});

for (const file of files) {
  const filePath = join(__dirname, file);
  // Use await with dynamic import() and get the .default property
  const modelDefinition = (await import(`file://${filePath}`)).default;
  const model = modelDefinition(sequelize, DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;