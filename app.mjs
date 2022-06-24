import express from 'express';
import _bodyParser from 'body-parser';
import { check, validationResult } from 'express-validator';
import session from 'express-session';
import bcrypt from 'bcrypt';
import {
  getUserReservations, getTripFromDb, getTripsFromDb, getUserById, getUserFromDb,
} from './database/get_data.mjs';
// import createUsers from './database/create_users.mjs';

const { urlencoded, json } = _bodyParser;

const PORT = 3000;

export default (db, port = PORT) => {
  const app = express();

  const sess = {
    secret: 'session',
    user: null,
    resave: false,
    saveUninitialized: false,
  };

  const saltRounds = 10;

  app.set('view engine', 'pug');
  app.set('views', './views');

  const options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['html', 'js', 'css'],
    index: false,
    maxAge: '1d',
    redirect: false,
  };

  app.use(express.static('public', options));
  app.use('/images', express.static('images'));

  app.use(session(sess));

  app.use(urlencoded({ extended: false }));
  app.use(json());

  function getTrip(startTransaction) {
    return async (req, res, next) => {
      let transaction = null;
      if (startTransaction) {
        transaction = await db.sequelize.transaction();
      }
      const { trip } = await getTripFromDb(db, req.params.id, transaction);
      if (!trip) {
        return next(new Error(`Failed to get trip with id: ${req.params.id}`));
      }
      res.locals.trip = trip;
      res.locals.transaction = transaction;
      return next();
    };
  }

  function createErrors(errorsMap) {
    const res = {};
    Object.keys(errorsMap).forEach((key) => {
      res[`${key}_err`] = errorsMap[key].msg;
    });
    return res;
  }

  app.get('/', async (req, res) => {
    res.render('main.pug', { trips: await getTripsFromDb(db) });
  });

  app.get('/register', async (req, res) => {
    res.render('register');
  });

  app.post(
    '/register',
    check('email').isEmail().withMessage('Niepoprawny mail'),
    check('first_name').notEmpty().withMessage('Puste imie'),
    check('last_name').notEmpty().withMessage('Puste nazwisko'),
    check('password').notEmpty().withMessage('Puste hasło'),
    check('confirm_password').notEmpty().withMessage('Puste potwierdzenie hasła')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Hasła się nie pokrywają');
        }
        return true;
      }),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('register', { ...createErrors(errors.mapped()) });
      }
      const hash = await bcrypt.hash(req.body.password, saltRounds);
      try {
        await db.users.create({
          name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          password: hash,
        });
        await db.sequelize.sync();
        return res.render('register', { info: 'registered' });
      } catch (error) {
        return res.render('register', { error: 'email already used' });
      }
    },
  );

  app.get('/login', (req, res) => {
    if (req.session.user) {
      return res.redirect('user');
    }
    return res.render('login');
  });

  app.get('/logout', (req, res) => {
    req.session.user = null;
    return res.redirect('/');
  });

  app.post(
    '/login',
    check('email').isEmail().withMessage('Niepoprawny mail'),
    check('password').notEmpty() // .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, 'i')
      .withMessage('Puste hasło'),
    async (req, res) => {
      const user = await getUserFromDb(db, req.body.email, req.body.password);
      if (user) {
        req.session.user = user;
        res.redirect('user');
      } else {
        res.render('login', { error: 'email / password don`t match' });
      }
    },
  );

  app.get('/user', async (req, res) => {
    if (req.session.user) {
      const { reservations } = await getUserReservations(db, req.session.user.id);
      res.render('user', {
        user: req.session.user,
        reservations: await Promise.all(reservations.map(async (el) => {
          const result = el;
          const { trip } = await getTripFromDb(db, el.TripId);
          result.tripName = trip.name;
          return result;
        })),
      });
    } else {
      res.redirect('/login');
    }
  });

  app.get('/trip/:id', getTrip(false), (req, res) => {
    const { trip } = res.locals;
    if (trip) {
      res.render('trip.pug', { trip });
    } else {
      res.redirect('/');
    }
  });

  app.get('/book/:id', getTrip(false), (req, res) => {
    const { trip } = res.locals;
    if (trip) {
      res.render('book.pug', { trip });
    } else {
      res.redirect('/');
    }
  });

  app.post(
    '/book/:id',
    getTrip(true),
    check('email').isEmail().withMessage('Niepoprawny mail'),
    check('first_name').notEmpty().withMessage('Puste imie'),
    check('last_name').notEmpty().withMessage('Puste nazwisko'),
    check('n_people')
      .isInt({ min: 0 })
      .withMessage('Liczba zgłoszeń musi być większa od 0'),
    async (req, res) => {
      const { trip } = res.locals;
      const { transaction } = res.locals;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('book', { ...{ trip }, ...createErrors(errors.mapped()) });
      }
      if (req.body.n_people > trip.free_seats) {
        await transaction.rollback();
        return res.render('book', { trip, error: 'Insufficient amount of free seats' });
      }
      try {
        const signUp = await db.reservations.create({
          name: req.body.first_name,
          surname: req.body.last_name,
          email: req.body.email,
          seats: req.body.n_people,
        }, { transaction });
        trip.addReservation(signUp, { transaction });
        trip.free_seats -= req.body.n_people;
        await trip.save({ transaction });
        if (req.session.user) {
          const userFromDb = await getUserById(db, req.session.user.id);
          if (!userFromDb) {
            throw new Error('No user in database');
          }
          userFromDb.addReservation(signUp, { transaction });
          await userFromDb.save({ transaction });
        }
        signUp.save({ transaction });
        await transaction.commit();
        return res.redirect(`/book-success/${req.params.id}`);
      } catch (e) {
        return res.render('book', { trip, error: 'Failed to create reservation' });
      }
    },
  );

  app.get('/book-success/:id', getTrip(false), async (req, res) => {
    res.render('book-success', {
      trip: res.locals.trip,
      info: 'Registered',
    });
  });

  app.use((err, req, res) => {
    res.render('error', { error: err });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.render('not-found', { error: '404 - not found' });
  });

  return app.listen(port, () => {
    // console.log(`Example app listening on port ${port}`);
  });
};
