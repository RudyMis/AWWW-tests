import { Op } from 'sequelize';
import bcrypt from 'bcrypt';

export const getTripsFromDb = async (db, t = null) => {
  try {
    return await db.trips.findAll({
      where: {
        start_date: {
          [Op.gt]: new Date(Date.now()),
        },
      },
      order: ['start_date'],
      transaction: t,
      lock: true,
    });
  } catch (e) {
    const arr = [];
    return arr;
  }
};

export const getTripFromDb = async (db, id, t = null) => {
  try {
    return {
      trip: await db.trips.findByPk(id, {
        transaction: t,
        lock: true,
      }),
    };
  } catch (e) {
    return {};
  }
};

export const getUserReservations = async (db, userId, t = null) => {
  try {
    return {
      reservations: await db.reservations.findAll({
        where: {
          UserId: userId,
        },
        transaction: t,
        lock: true,
      }),
    };
  } catch (e) {
    return {};
  }
};

export const getTripReservations = async (db, tripId, t = null) => {
  try {
    return {
      reservations: await db.reservations.findAll({
        where: {
          TripId: tripId,
        },
        transaction: t,
        lock: true,
      }),
    };
  } catch (e) {
    return {};
  }
};

export const getUserFromDb = async (db, email, password, t = null) => {
  try {
    const users = await db.users.findAll({
      transaction: t,
      lock: true,
      attributes: ['email', 'password', 'name', 'last_name', 'id'],
      where: {
        email,
      },
    });
    if (users.length === 0) {
      return null;
    }
    if (users.length > 1) {
      throw new Error('email duplicate in database');
    }
    if (await bcrypt.compare(password, users[0].password)) {
      return users[0];
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const getUserById = async (db, id, t = null) => {
  try {
    return await db.users.findByPk(id, { transaction: t });
  } catch (e) {
    return null;
  }
};
