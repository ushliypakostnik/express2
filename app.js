import express from 'express';

import session from 'express-session';
import mongoose from 'mongoose';
import cors from 'cors';

import User from './models/user';
import passport from './config/passport';
import router from './routes/index';

import config from './config/config';

const app = express();

// Session config
app.use(session({
  secret: '2C44-4D44-WppQ38S',
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false
}));

// db url
const mongoDB = process.env.MONGOLAB_URI || 'mongodb://levongambaryan:newflower1@ds137435.mlab.com:37435/alcousersdb';

// db connect
mongoose.connect(mongoDB, {
  useCreateIndex: true,
  useNewUrlParser: true,
});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// CORS
if (config.CORS_ENABLED) {
  app.use(cors());
}

app.use(router);

export default app;
