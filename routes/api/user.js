import { Router } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import passport from '../../config/passport';
import auth from '../auth';

const router = Router();
const jsonParser = bodyParser.json();
const User = mongoose.model('User');

// POST new user route (optional, everyone has access)
router.post('/', auth.optional, (req, res) => {
  const { body: { user } } = req;

  if (!user.email) {
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

  const finalUser = new User(user);

  finalUser.setPassword(user.password);

  return finalUser.save()
    .then(() => res.json({ user: finalUser.toAuthJSON() }));
});

// POST login route (optional, everyone has access)
router.post('/login', auth.optional, jsonParser, (req, res, next) => {
  const { body: { user } } = req;

  if (!user.email) {
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
/*
  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      const u = passportUser;
      user.token = passportUser.generateJWT();

      return res.json({ user: u.toAuthJSON() });
    }

    return info.status(400);
  })(req, res, next);
*/
});

// GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res) => {
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
