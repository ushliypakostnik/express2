import { Router } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import auth from '../auth';
import passport from '../../config/passport';
import { sendVerifyEmail } from '../../config/mailer';

const router = Router();
const jsonParser = bodyParser.json();
const User = mongoose.model('User');

// POST login route (optional, everyone has access)
router.post('/login', auth.optional, jsonParser, (req, res, next) => {
  const { body: { user } } = req;

  if (!user.usermail) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  // eslint-disable-next-line no-unused-vars
  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) return next(err);

    // Если есть такой пользователь
    if (passportUser) {
      return res.json({ user: passportUser.toAuthJSON() });
    }

    // Если нет - регистрируем нового
    const finalUser = new User(user);

    finalUser.setPassword(user.password);

    return finalUser.save()
      .then((responce) => {
        // console.log("Отправляем письмо для верификации нового аккаунта!");
        const { usermail } = responce;
        const userid = responce._id; // eslint-disable-line no-underscore-dangle
        sendVerifyEmail(usermail, userid);
        res.json({ user: responce.toAuthJSON() });
      })
      .catch(() => {
        res.sendStatus(400);
      });
  })(req, res, next);
});

// GET Send verification email
router.get('/send-verify-email', auth.required, jsonParser, (req, res) => {
  const { user: { usermail } } = req;
  User.findOne({ usermail }, (err, user) => {
    if (err) return res.status(400).send();

    // console.log("Отправляем письмо для верификации аккаунта!");
    const userid = user._id; // eslint-disable-line no-underscore-dangle
    sendVerifyEmail(usermail, userid);
    return res.sendStatus(200);
  });
});

// GET Logout
router.get('/logout', auth.required, (req, res) => {
  req.session.destroy();
  res.send('logout success!');
});

export default router;
