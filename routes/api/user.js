import { Router } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import auth from '../auth';
import passport from '../../config/passport';
import { sendVerifyEmail } from '../../config/mailer';

import config from '../../config/config';

const router = Router();
const jsonParser = bodyParser.json();
const User = mongoose.model('User');

// POST login route (optional, everyone has access)
router.post('/login', auth.optional, jsonParser, (req, res, next) => {
  const { body: { user } } = req;

  // eslint-disable-next-line no-unused-vars
  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) return next(err);

    // Если пользователь есть в базе
    // Валидный пароль для этого email
    if (passportUser) {
      return res.json({ user: passportUser.toAuthJSON() });
    }

    // Не валидный пароль для этого email
    if (!passportUser && info) {
      const { usermail } = user;
      User.findOne({ usermail }, (err, user) => {
        if (err) return res.sendStatus(400);

        // console.log("Отправляем данные профиля для аккаунта!", user);
        res.status(422).json({
          errors: { message: 'Email password pair incorrect' },
        });
      });
    }

    // Если пользователя нет в базе - регистрируем нового
    const finalUser = new User(user);
    finalUser.setNewUser(user.password);

    return finalUser.save()
      .then((response) => {
        const { usermail } = response;
        const userrand = response.verify.rand; // eslint-disable-line no-underscore-dangle
        // console.log("Отправляем письмо для верификации нового аккаунта!", usermail, userrand);
        sendVerifyEmail(usermail, userrand);
        res.json({ user: response.toAuthJSON() });
      })
      .catch((error) => {
        // console.log("Не удалось сохранить новый аккаунт!", error.errmsg);
        res.status(400).json({
          errors: { message: 'Authentication / Registration failed' },
        });
      });
  })(req, res, next);
});

// GET Send verification email
router.get('/send-verify-email', auth.required, jsonParser, (req, res) => {
  const { user: { usermail } } = req;
  User.findOne({ usermail }, (err, user) => {
    if (err) return res.sendStatus(400);

    // console.log("Отправляем письмо для верификации аккаунта!", usermail);
    const userrand = user.verify.rand; // eslint-disable-line no-underscore-dangle
    sendVerifyEmail(usermail, userrand);
    return res.sendStatus(200);
  });
});

// GET Verify account
router.get('/verify', auth.optional, jsonParser, (req, res) => {
  User.findOne({ verify: { isVerify: false, rand: req.query.id } }, (err, user) => {
    if (err) return res.sendStatus(400);

    const { usermail } = user;
    return User.findOneAndUpdate({ usermail },
      { $set: { verify: { isVerify: true, rand: null } } },
      { returnOriginal: false }, (error, verifyUser) => { // eslint-disable-line no-unused-vars
        if (error) return res.sendStatus(400);

        console.log('Пользователь верифицирован: ', user);
        return res.redirect(config.CLIENT_HOST);
      });
  });
});

// GET User profile
router.get('/profile', auth.required, jsonParser, (req, res) => {
  const { user: { usermail } } = req;
  User.findOne({ usermail }, (err, user) => {
    if (err) return res.sendStatus(400);

    // console.log("Отправляем данные профиля для аккаунта!", user);
    return res.json({ user: user.toProfileJSON() });
  });
});

// GET Logout
router.get('/logout', auth.required, (req, res) => {
  req.session.destroy();
  res.send('logout success!');
});

export default router;
