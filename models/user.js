import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import config from '../config/config';

// User Model

const { Schema } = mongoose;

const UserSchema = new Schema({
  usermail: { type: String, required: true, unique: true },
  username: { type: String },
  hash: { type: String },
  salt: { type: String },
  userinfo: { type: Object },
});

// eslint-disable-next-line func-names
UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  this.username = [this.usermail.split('@')];
};

// eslint-disable-next-line func-names
UserSchema.methods.validatePassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

// eslint-disable-next-line func-names
UserSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this.id,
    usermail: this.usermail,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, config.SECRET);
};

// eslint-disable-next-line func-names
UserSchema.methods.toAuthJSON = function () {
  return {
    id: this.id,
    usermail: this.usermail,
    token: this.generateJWT(),
  };
};

const User = mongoose.model('User', UserSchema);

export default User;
