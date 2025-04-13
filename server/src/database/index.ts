// server/src/database/index.ts
import { Sequelize } from 'sequelize-typescript';
import config from '../config';
import logger from '../utils/logger';

export const sequelize = new Sequelize({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  dialect: 'postgres',
  username: config.db.user,
  password: config.db.password,
  models: [__dirname + '/models'],
  logging: msg => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test database connection
export const testDbConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};
