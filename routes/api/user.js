import { Router } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import passport from '../../config/passport';
import auth from '../auth';

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
    if (err) {
      return next(err);
    }

    if (passportUser) {
      return res.json({ user: passportUser.toAuthJSON() });
    }

    const finalUser = new User(user);

    finalUser.setPassword(user.password);

    return finalUser.save()
      .then(() => {
        res.json({ user: finalUser.toAuthJSON() });
      })
      .catch(() => {
        res.sendStatus(400);
      });
  })(req, res, next);
});

router.get('/logout', auth.required, (req, res) => {
  req.session.destroy();
  res.send('logout success!');
});

// GET current route (required, only authenticated users have access)
router.get('/account', auth.required, (req, res) => {
  const { payload: { id } } = req;

  return User.findById(id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
});

export default router;
