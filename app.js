import express from 'express';

import session from 'express-session';
import mongoose from 'mongoose';
import cors from 'cors';

import User from './models/user'; // eslint-disable-line no-unused-vars
import passport from './config/passport'; // eslint-disable-line no-unused-vars
import router from './routes/index';

import config from './config/config';

const app = express();

// Session config
app.use(session({
  secret: config.SECRET,
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false,
}));

// db url
const mongoDB = process.env.MONGOLAB_URI || 'mongodb://levongambaryan:testbase1@ds347467.mlab.com:47467/test01';

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

app.use(passport.initialize());
app.use(passport.session());

app.use(router);

export default app;
