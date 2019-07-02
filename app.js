import express from 'express';

import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import hashers from 'node-django-hashers';

import config from './config';

const jsonParser = bodyParser.json();
const h = new hashers.PBKDF2PasswordHasher(); // eslint-disable-line no-unused-vars

const app = express();

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

// Model

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  usermail: { type: String },
  password: { type: String, required: true },
  userinfo: { type: Object },
});

const User = mongoose.model('User', UserSchema);

console.log(User);

// CORS
if (config.CORS_ENABLED) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
}

// API

// Get active user
app.get('/api/user', (req, res) => {
  const userName = 'Levon';

  User.findOne({ username: userName }, (err, user) => {
    if (err) return res.status(400).send();

    return res.send(user);
  });
});

// Put active user
app.put('/api/user', jsonParser, (req, res) => {
  User.findOneAndUpdate({ returnOriginal: false },
    (err, user) => {
      if (err) return res.status(400).send();
      // console.log('Обновлён пользователь: ', user);
      return res.send(user);
    });
});

app.get('/', (req, res) => {
  res.send(200);
});

// Others
app.use((req, res) => {
  res.status(404);
  res.send('Page not found!!!');
});

module.exports = app;
