import PASS from './pass';

require('dotenv').config();

const env = process.env.NODE_ENV;

const development = {
  PORT: process.env.PORT || 8082,
  MEDIA_DIR: process.env.MEDIA_DIR || 'html',
  MEDIA_URL: process.env.MEDIA_URL || 'http://127.0.0.1:8082/',
  STATIC_SERVE: false,
  CORS_ENABLED: true,
  SECRET: 'secret',
  PASS,
};

const production = {
  PORT: process.env.PORT || 8082,
  MEDIA_DIR: process.env.MEDIA_DIR || 'media',
  MEDIA_URL: process.env.MEDIA_URL || 'http://www.yourserver.com/media',
  STATIC_SERVE: false,
  CORS_ENABLED: false,
  SECRET: 'secret',
  PASS,
};

const config = {
  development,
  production,
};

export default config[env];
