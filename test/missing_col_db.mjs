/* eslint-disable import/extensions */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { equal } from 'assert';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { promises as fsp } from 'fs';
import {
  Builder, Capabilities,
} from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';
import { DataTypes } from 'sequelize';
import { getDBLocal } from '../database/db.mjs';
import { sampleTrip } from '../database/create_trip.mjs';
import { getTripsFromDb } from '../database/get_data.mjs';
import app from '../app.mjs';

should = chai.should();
const { expect } = chai;
chai.use(chaiHttp);

async function canGetPage(driver, page, shouldGet404 = false) {
  await driver.get(page);
  const source = await driver.getPageSource();
  if (source.includes('404') && !shouldGet404) {
    console.log('went on 404');
    equal(1, 0);
  }
}

async function takeScreenshot(driver, file) {
  const image = await driver.takeScreenshot();
  await fsp.writeFile(file, image, 'base64');
}

describe('Database missing columns', function () {
  let db = {};
  let driver = {};
  const TIMEOUT = 2000;

  beforeEach(async function () {
    db = await getDBLocal();
    await sampleTrip(db);
  });

  before(async function () {
    this.timeout(10000);
    driver = new Builder().withCapabilities(Capabilities.firefox())
      .setFirefoxOptions(new firefox.Options().headless().windowSize({
        width: 1920,
        height: 1080,
      }))
      .build();
    await driver
      .manage()
      .setTimeouts({ implicit: TIMEOUT, pageLoad: TIMEOUT, script: TIMEOUT });
  });

  after(async function () {
    await driver.quit();
  });

  describe('trips', function () {
    let appHandle = {};

    beforeEach(async function () {
      db.trips.drop();
      db.trips = db.sequelize.define('Trip', {
        desc: {
          type: DataTypes.STRING,
        },
        short_desc: {
          type: DataTypes.STRING,
        },
        start_date: {
          type: DataTypes.DATEONLY,
        },
        end_date: {
          type: DataTypes.DATEONLY,
          validate: {
            is_after_start(value) {
              if (value < this.data_poczatku) {
                throw new Error('data konca nie moze byc przed data poczatku');
              }
            },
          },
        },
        free_seats: {
          type: DataTypes.INTEGER,
        },
      });
      await db.sequelize.sync();
      await db.trips.create({
        desc: 'Trip 2',
        short_desc: 'Trip 2',
        start_date: '2022-07-16',
        end_date: '2022-07-31',
        free_seats: 6,
      });
      appHandle = app(db);
    });

    afterEach(async function () {
      appHandle.close();
    });

    it('should get front page', async function () {
      await canGetPage(driver, 'http://localhost:3000');
    });

    it('should get trip page', async function () {
      await canGetPage(driver, 'http://localhost:3000/trip/1');
      await takeScreenshot(driver, 'trip-page.png');
    });

    it('should get 1 trip', async function () {
      const trips = await getTripsFromDb(db);
      trips.should.have.length(1);
    });
  });

  describe('reservations', function () {
    let appHandle = {};

    beforeEach(async function () {
      db.reservations.drop();
      db.reservations = db.sequelize.define('Reservation', {
        surname: {
          type: DataTypes.STRING,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isEmail: true,
          },
        },
      });
      db.sequelize.sync();
      appHandle = app(db);
    });

    this.afterEach(async function () {
      appHandle.close();
    });

    it('should get front page', async function () {
      await canGetPage(driver, 'http://localhost:3000');
    });

    it('should try to create reservation', function (done) {
      this.timeout(4000);
      chai.request('http://localhost:3000').post('/book/1/').type('form')
        .send({
          email: 'abc@abc.com',
          first_name: 'Andrzej',
          last_name: 'Andrzej',
          n_people: 1,
        })
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  describe('users', function () {
    let appHandle = {};

    beforeEach(async function () {
      db.users.drop();
      db.users = db.sequelize.define('User', {
        last_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      });
      db.sequelize.sync();
      appHandle = app(db);
    });

    afterEach(function () {
      appHandle.close();
    });

    it('should get front page', async function () {
      await canGetPage(driver, 'http://localhost:3000');
    });

    it('should try to register', function (done) {
      chai.request('http://localhost:3000').post('/register').type('form')
        .send({
          email: 'abc@abc.com',
          first_name: 'Andrzej',
          last_name: 'Andrzej',
          password: 'password',
          confirm_password: 'password',
        })
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should try to login', function (done) {
      chai.request('http://localhost:3000').post('/login').type('form')
        .send({
          email: 'abc@abc.com',
          password: 'password',
        })
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });
  });
});
