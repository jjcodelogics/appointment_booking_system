'use strict';

import { readdirSync } from 'fs';
import { basename as _basename, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import { env as _env } from 'process';
import dotenv from 'dotenv';

dotenv.config();

// Recreate __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically import the CJS config file
const configPath = join(__dirname, '..', '..', 'config', 'config.js');
const configModule = await import(`file://${configPath}`);
const config = configModule[_env.NODE_ENV || 'development'];


const sequelize = new Sequelize(process.env.DATABASE_URL || DB_CONNECTION_STRING, {
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: false, // Disabled SQL logging for production
  // ...other options...
});

const db = {};

export const initializeModels = async () => {
  const modelsDir = join(process.cwd(), 'src', 'models');
  const modelFiles = readdirSync(modelsDir).filter((file) =>
    file !== 'index.js' && /\.(js|mjs|cjs)$/.test(file)
  );

  for (const file of modelFiles) {
    const filePath = join(modelsDir, file);
    console.log(`Loading model from file: ${filePath}`);
    // ensure ESM loader resolves local file paths correctly
    const modelModule = await import(`file://${filePath}`);
    const modelDefinition = modelModule.default;

    if (typeof modelDefinition === 'function') {
      const model = modelDefinition(sequelize, Sequelize.DataTypes);
      if (!model) {
        console.error(`Model factory in ${file} returned undefined`);
      } else {
        console.log(`Model loaded: ${model.name}`);
        db[model.name] = model;
      }
    } else {
      console.error(`Model file ${file} does not export a default function.`);
    }
  }

  // Set up associations if any
  Object.keys(db).forEach((modelName) => {
    if (typeof db[modelName].associate === 'function') {
      db[modelName].associate(db);
    }
  });

  // expose sequelize instances
  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  console.log('Database models initialized successfully.');
};

export default db;