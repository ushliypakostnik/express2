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
  verify: {
    rand: { type: String },
    isVerify: { type: Boolean, default: false },
  },
  userdata: { type: Object, default: [] },
});

// eslint-disable-next-line func-names
UserSchema.methods.setNewUser = function (password) {
  // console.log('User set password ', password);
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  this.username = this.usermail.split('@')[0] + Math.floor(Math.random() * 1000); // eslint-disable-line prefer-destructuring
  this.verify.rand = crypto.randomBytes(16).toString('hex');
};

// eslint-disable-next-line func-names
UserSchema.methods.validatePassword = function (password) {
  // console.log('User validate password ', password);
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

// eslint-disable-next-line func-names
UserSchema.methods.generateJWT = function () {
  // console.log('User generate JWT');
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
  // console.log('User to Auth JSON');
  return {
    id: this.id,
    usermail: this.usermail,
    token: this.generateJWT(),
  };
};

// eslint-disable-next-line func-names
UserSchema.methods.toProfileJSON = function () {
  // console.log('User to Profile JSON ');
  return {
    id: this.id,
    usermail: this.usermail,
    username: this.username,
    userdata: this.userdata,
  };
};

const User = mongoose.model('User', UserSchema);

export default User;
