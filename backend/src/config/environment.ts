import 'dotenv/config';

export const ENV = {
  PORT: process.env.PORT || 3001,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_USERNAME: process.env.DB_USERNAME || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  DB_DATABASE: process.env.DB_DATABASE || 'prm_db',
  JWT_SECRET: process.env.JWT_SECRET || 'your-very-secret-key',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};