/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiHttp from 'chai-http';
import Sinon from 'sinon';
import app from '../app.mjs';
import { sampleTrip } from '../database/create_trip.mjs';
import { getDBLocal } from '../database/db.mjs';
import { getTripFromDb, getTripsFromDb } from '../database/get_data.mjs';

const { expect } = chai;
chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Add to database', function () {
  const time = new Date(2022, 6);
  let clock = {};
  let db = {};

  beforeEach(async function () {
    clock = Sinon.useFakeTimers(time);
    db = await getDBLocal();
  });

  afterEach(function () {
    clock.restore();
  });

  describe('trips', function () {
    it('with negative number of seats', async function () {
      await expect(db.trips.create({
        name: 'Trip1',
        desc: 'This trip should not be created',
        short_desc: 'At all',
        img: 'https://cdn.mos.cms.futurecdn.net/VWNYrSJUdBNoJbdK9WHgCA-970-80.jpg',
        price: 15,
        start_date: '2022-07-16',
        end_date: '2022-07-15',
        free_seats: -15,
      })).to.be.rejected;
    });

    it('with start date after end', async function () {
      await expect(db.trips.create({
        name: 'Trip1',
        desc: 'This trip should not be created',
        short_desc: 'At all',
        img: 'https://cdn.mos.cms.futurecdn.net/VWNYrSJUdBNoJbdK9WHgCA-970-80.jpg',
        price: 15,
        start_date: '2022-07-16',
        end_date: '2022-07-15',
        free_seats: 15,
      })).to.be.rejected;
    });

    it('with negative price', async function () {
      await expect(db.trips.create({
        name: 'Trip1',
        desc: 'This trip should not be created',
        short_desc: 'At all',
        img: 'https://cdn.mos.cms.futurecdn.net/VWNYrSJUdBNoJbdK9WHgCA-970-80.jpg',
        price: -15,
        start_date: '2022-07-16',
        end_date: '2022-07-17',
        free_seats: 15,
      })).to.be.rejected;
    });

    it('with missing fields', async function () {
      await expect(db.trips.create({
        desc: 'This trip should not be created',
        short_desc: 'At all',
        img: 'https://cdn.mos.cms.futurecdn.net/VWNYrSJUdBNoJbdK9WHgCA-970-80.jpg',
        price: 15,
        start_date: '2022-07-16',
        end_date: '2022-07-17',
        free_seats: 15,
      })).to.be.rejected;
      await expect(db.trips.create({
        name: 'Trip1',
        short_desc: 'At all',
        img: 'https://cdn.mos.cms.futurecdn.net/VWNYrSJUdBNoJbdK9WHgCA-970-80.jpg',
        price: 15,
        start_date: '2022-07-16',
        end_date: '2022-07-17',
        free_seats: 15,
      })).to.be.rejected;
      await expect(db.trips.create({
        name: 'Trip1',
        desc: 'This trip should not be created',
        img: 'https://cdn.mos.cms.futurecdn.net/VWNYrSJUdBNoJbdK9WHgCA-970-80.jpg',
        price: 15,
        start_date: '2022-07-16',
        end_date: '2022-07-17',
        free_seats: 15,
      })).to.be.rejected;
      await expect(db.trips.create({
        name: 'Trip1',
        desc: 'This trip should not be created',
        short_desc: 'At all',
        price: 15,
        start_date: '2022-07-16',
        end_date: '2022-07-17',
        free_seats: 15,
      })).to.be.rejected;
      await expect(db.trips.create({
        name: 'Trip1',
        desc: 'This trip should not be created',
        short_desc: 'At all',
        img: 'https://cdn.mos.cms.futurecdn.net/VWNYrSJUdBNoJbdK9WHgCA-970-80.jpg',
        start_date: '2022-07-16',
        end_date: '2022-07-17',
        free_seats: 15,
      })).to.be.rejected;
      await expect(db.trips.create({
        name: 'Trip1',
        desc: 'This trip should not be created',
        short_desc: 'At all',
        img: 'https://cdn.mos.cms.futurecdn.net/VWNYrSJUdBNoJbdK9WHgCA-970-80.jpg',
        price: 15,
        end_date: '2022-07-17',
        free_seats: 15,
      })).to.be.rejected;
      await expect(db.trips.create({
        name: 'Trip1',
        desc: 'This trip should not be created',
        short_desc: 'At all',
        img: 'https://cdn.mos.cms.futurecdn.net/VWNYrSJUdBNoJbdK9WHgCA-970-80.jpg',
        price: 15,
        start_date: '2022-07-16',
        free_seats: 15,
      })).to.be.rejected;
      await expect(db.trips.create({
        name: 'Trip1',
        desc: 'This trip should not be created',
        short_desc: 'At all',
        img: 'https://cdn.mos.cms.futurecdn.net/VWNYrSJUdBNoJbdK9WHgCA-970-80.jpg',
        price: 15,
        start_date: '2022-07-16',
        end_date: '2022-07-17',
      })).to.be.rejected;
    });
  });

  describe('reservations', function () {
    let tripId = 0;

    beforeEach(async function () {
      await sampleTrip(db);
      tripId = (await getTripsFromDb(db))[0].id;
    });

    it('with zero of seats', async function () {
      await expect(db.reservations.create({
        name: 'Andrzej',
        surname: 'Nowak',
        email: 'andrzej.nowak@wp.pl',
        seats: -1,
      })).to.be.rejected;
    });

    it('with too many seats', async function () {
      await expect(db.reservations.create({
        name: 'Andrzej',
        surname: 'Nowak',
        email: 'andrzej.nowak@wp.pl',
        seats: 5,
      })).to.be.rejected;
    });

    it('with empty email field', async function () {
      await expect(db.reservations.create({
        name: 'Andrzej',
        surname: 'Nowak',
        seats: 1,
      })).to.be.rejected;
    });

    it('with more seats than free seats', async function () {
      const appHandle = app(db);
      let { trip } = await getTripFromDb(db, tripId);
      while (trip.free_seats > 3) {
        // eslint-disable-next-line no-await-in-loop
        await chai.request('http://localhost:3000').post(`/book/${tripId}`).type('form')
          .send({
            email: 'abc@abc.com',
            first_name: 'Andrzej',
            last_name: 'Andrzej',
            n_people: 1,
          });
        // eslint-disable-next-line no-await-in-loop
        trip = (await getTripFromDb(db, tripId)).trip;
      }
      await chai.request('http://localhost:3000').post(`/book/${tripId}`).type('form')
        .send({
          email: 'abc@abc.com',
          first_name: 'Andrzej',
          last_name: 'Andrzej',
          n_people: 4,
        });
      expect(trip.free_seats).to.be.equal(3);
      appHandle.close();
    });

    it('with perfect number of seats', async function () {
      const appHandle = app(db);
      let { trip } = await getTripFromDb(db, tripId);
      while (trip.free_seats > 4) {
        // eslint-disable-next-line no-await-in-loop
        await chai.request('http://localhost:3000').post(`/book/${tripId}`).type('form')
          .send({
            email: 'abc@abc.com',
            first_name: 'Andrzej',
            last_name: 'Andrzej',
            n_people: 1,
          });
        // eslint-disable-next-line no-await-in-loop
        trip = (await getTripFromDb(db, tripId)).trip;
      }
      await chai.request('http://localhost:3000').post(`/book/${tripId}`).type('form')
        .send({
          email: 'abc@abc.com',
          first_name: 'Andrzej',
          last_name: 'Andrzej',
          n_people: 4,
        });
      trip = (await getTripFromDb(db, tripId)).trip;
      expect(trip.free_seats).to.be.equal(0);
      appHandle.close();
    });
  });

  describe('users', function () {
    it('two users with same mail', async function () {
      // Check by finding number of registered users
      const appHandle = app(db);
      const usersBeforeFirst = (await db.users.findAll()).length;
      await chai.request('http://localhost:3000').post('/register').type('form')
        .send({
          email: 'andrzej@abc.com',
          first_name: 'Andrzej',
          last_name: 'Andrzej',
          password: 'AndrzejAndrzej',
          confirm_password: 'AndrzejAndrzej',
        });
      const usersAfterFirst = (await db.users.findAll()).length;
      expect(usersAfterFirst).to.be.equal(usersBeforeFirst + 1);
      await chai.request('http://localhost:3000').post('/register').type('form')
        .send({
          email: 'andrzej@abc.com',
          first_name: 'NieAndrzej',
          last_name: 'NieAndrzej',
          password: 'NieAndrzejAndrzej',
          confirm_password: 'NieAndrzejAndrzej',
        });
      expect((await db.users.findAll()).length).to.be.equal(usersAfterFirst);
      appHandle.close();
    });
  });
});
