import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import hashers from 'node-django-hashers';

const h = new hashers.PBKDF2PasswordHasher(); // eslint-disable-line no-unused-vars

// Model

const { Schema } = mongoose;

const UserSchema = new Schema({
  usermail: { type: String, required: true, unique: true },
  username: { type: String, unique: true },
  password: { type: String, required: true },
  userinfo: { type: Object },
});

UserSchema.methods.setPassword = (password) => {
  this.salt = h.salt();
  this.hash = h.encode(password, this.salt);
};

UserSchema.methods.validatePassword = (password) => {
  const hash = h.encode(password, this.salt);
  return this.hash === hash;
};

UserSchema.methods.generateJWT = () => {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
    email: this.usermail,
    id: this.id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, 'secret');
};

UserSchema.methods.toAuthJSON = () => ({
  id: this.id,
  usermail: this.usermail,
  token: this.generateJWT(),
});

const User = mongoose.model('User', UserSchema);

export default User;
