import { Sequelize } from 'sequelize';
import trip from '../models/trip.mjs';
import reservation from '../models/reservation.mjs';
import user from '../models/user.mjs';

export default function f() { }

export const getDB = async (sequelize) => {
  try {
    await sequelize.authenticate();

    const db = {};

    db.sequelize = sequelize;
    db.trips = trip(db.sequelize);
    db.reservations = reservation(db.sequelize);
    db.users = user(db.sequelize);
    await db.sequelize.sync();

    await db.trips.hasMany(db.reservations);
    await db.users.hasMany(db.reservations);

    await db.sequelize.sync();
    return db;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export const getDBPostgres = async (logging = false) => {
  const sequelize = new Sequelize('bd', 'mw429660', 'iks', {
    host: 'localhost',
    port: '2231',
    dialect: 'postgres',
    logging,
  });
  return getDB(sequelize);
};

export const getDBLocal = async (logging = false, file = ':memory:') => {
  const sequelize = new Sequelize(`sqlite:${file}`, {
    logging,
  });
  return getDB(sequelize);
};
