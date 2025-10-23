'use strict';

import { Sequelize } from 'sequelize';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Throw an error if the DATABASE_URL is not set. This is safer.
if (!process.env.DATABASE_URL) {
  throw new Error('FATAL ERROR: DATABASE_URL is not defined in your .env file.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', // Assuming postgres
  logging: false,
});

const db = {};

export const initializeModels = async () => {
  const modelsDir = join(process.cwd(), 'src', 'models');
  const modelFiles = readdirSync(modelsDir).filter((file) =>
    file !== 'index.js' && /\.(js|mjs|cjs)$/.test(file)
  );

  for (const file of modelFiles) {
    const filePath = join(modelsDir, file);

    // ensure ESM loader resolves local file paths correctly
    const modelModule = await import(`file://${filePath}`);
    const modelDefinition = modelModule.default;

    if (typeof modelDefinition === 'function') {
      const model = modelDefinition(sequelize, Sequelize.DataTypes);
      if (model) {
        db[model.name] = model;
      }
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