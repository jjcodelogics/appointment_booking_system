#!/usr/bin/env node

/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js <email> <name> <password>
 * Example: node scripts/create-admin.js admin@example.com "Admin User" "SecurePass123!"
 */

import { initializeModels } from '../src/models/index.js';
import db from '../src/models/index.js';

async function createAdmin() {
  const [email, name, password] = process.argv.slice(2);

  if (!email || !name || !password) {
    console.error('Usage: node scripts/create-admin.js <email> <name> <password>');
    console.error(
      'Example: node scripts/create-admin.js admin@example.com "Admin User" "SecurePass123!"'
    );
    process.exit(1);
  }

  // Validate password strength
  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters long');
    process.exit(1);
  }
  if (!/[A-Z]/.test(password)) {
    console.error('Error: Password must contain at least one uppercase letter');
    process.exit(1);
  }
  if (!/[a-z]/.test(password)) {
    console.error('Error: Password must contain at least one lowercase letter');
    process.exit(1);
  }
  if (!/[0-9]/.test(password)) {
    console.error('Error: Password must contain at least one number');
    process.exit(1);
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    console.error('Error: Password must contain at least one special character');
    process.exit(1);
  }

  try {
    // Initialize models
    await initializeModels();

    // Check if user already exists
    const existingUser = await db.User.findOne({ where: { username_email: email } });
    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`);
      process.exit(1);
    }

    // Create admin user
    const adminUser = await db.User.create({
      username_email: email,
      name: name,
      password: password,
      role: 'admin',
    });

    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('User ID:', adminUser.user_id);
    console.log('Email:', adminUser.username_email);
    console.log('Name:', adminUser.name);
    console.log('Role:', adminUser.role);
    console.log('-----------------------------------');
    console.log('You can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();
