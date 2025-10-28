'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('session', {
    sid: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
    sess: { type: Sequelize.JSONB, allowNull: false },
    expire: { type: Sequelize.DATE(6), allowNull: false },
  });
  await queryInterface.addIndex('session', ['expire'], { name: 'IDX_session_expire' });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('session');
}
