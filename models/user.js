import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Model

const { Schema } = mongoose;

const UserSchema = new Schema({
  usermail: { type: String, required: true, unique: true },
  username: { type: String, unique: true },
  password: { type: String, required: true },
  hash: { type: String },
  salt: { type: String },
  userinfo: { type: Object },
});

UserSchema.methods.setPassword = function (password) { // eslint-disable-line func-names
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validatePassword = function (password) { // eslint-disable-line func-names
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.generateJWT = function () { // eslint-disable-line func-names
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  console.log(this);

  return jwt.sign({
    id: this.id,
    usermail: this.usermail,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, 'secret');
};

UserSchema.methods.toAuthJSON = function () { // eslint-disable-line func-names
  return {
    id: this.id,
    usermail: this.usermail,
    token: this.generateJWT(),
  };
};

const User = mongoose.model('User', UserSchema);

export default User;
