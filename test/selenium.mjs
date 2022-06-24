/* eslint-disable import/extensions */
/* eslint-disable no-undef */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { promises as fsp } from 'fs';
import {
  Builder, By, Capabilities, until,
} from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { equal } from 'assert';
import app from '../app.mjs';
import { getDBLocal } from '../database/db.mjs';
import { sampleTrip } from '../database/create_trip.mjs';
import { getTripsFromDb } from '../database/get_data.mjs';

chai.use(chaiHttp);
should = chai.should();

async function takeScreenshot(driver, file) {
  const image = await driver.takeScreenshot();
  await fsp.writeFile(file, image, 'base64');
}

export default () => { };

export async function fillReservationForm(driver, id, {
  name,
  surname,
  email,
  phone,
  seats,
  rodo,
}) {
  await driver.get(`localhost:3000/book/${id}`);
  await driver.findElement(By.name('first_name')).sendKeys(name);
  await driver.findElement(By.name('last_name')).sendKeys(surname);
  await driver.findElement(By.name('email')).sendKeys(email);
  await driver.findElement(By.name('phone')).sendKeys(phone);
  await driver.findElement(By.name('n_people')).sendKeys(seats);
  if (rodo) {
    await driver.findElement(By.name('gdpr_permission')).click();
  }
  await driver.findElement(By.name('submit')).click();
}

async function fillRegisterForm(driver, {
  name, surname, email, password,
}) {
  await driver.get('localhost:3000/register');
  await driver.findElement(By.name('first_name')).sendKeys(name);
  await driver.findElement(By.name('last_name')).sendKeys(surname);
  await driver.findElement(By.name('email')).sendKeys(email);
  await driver.findElement(By.name('password')).sendKeys(password);
  await driver.findElement(By.name('confirm_password')).sendKeys(password);
  await driver.findElement(By.name('gdpr_permission')).click();
  await driver.findElement(By.name('submit')).click();
}

describe('Selenium', function () {
  const TIMEOUT = 4000;
  let driver = {};
  let appHandle = {};
  let db = {};

  before(async function () {
    this.timeout(10000);
    db = await getDBLocal();
    await sampleTrip(db);

    appHandle = app(db);
    driver = new Builder().withCapabilities(Capabilities.firefox())
      .setFirefoxOptions(new firefox.Options().headless().windowSize({
        width: 1920,
        height: 1080,
      })).build();
    await driver
      .manage()
      .setTimeouts({ implicit: TIMEOUT, pageLoad: TIMEOUT, script: TIMEOUT });
  });

  it('check title', async function () {
    this.timeout(0);
    await driver.get('http://localhost:3000');
    await takeScreenshot(driver, 'test.png');
    const title = await driver.getTitle();
    equal(title, 'Biuro podróży');
  });

  it('check bad page', async function () {
    await driver.get('http://localhost:3000/non-existing-page');
    await takeScreenshot(driver, 'error-page.png');
    const els = await driver.findElements(By.id('error_msg'));
    els.should.have.length(1);
    const text = await els[0].getText();
    text.should.equal('404 - not found');
  });

  it('check number of trips', async function () {
    await driver.get('http://localhost:3000');
    const els = await driver.findElements(By.className('trip'));
    const trips = await getTripsFromDb(db);
    expect(els).to.have.length(trips.length);
  });

  it('check bad reservation form', async function () {
    this.timeout(10000);
    const trips = await getTripsFromDb(db);
    should.exist(trips.length);
    trips.length.should.be.at.least(1);
    should.exist(trips[0].id);
    const { id } = trips[0];
    await fillReservationForm(driver, id, {
      name: '',
      surname: 'Nowak',
      email: 'andrzej.nowak@wp.pl',
      phone: '123456789',
      seats: 3,
      rodo: true,
    });
    let url = await driver.getCurrentUrl();
    url.should.equal(`http://localhost:3000/book/${id}`);
    await fillReservationForm(driver, id, {
      name: 'Andrzej',
      surname: '',
      email: 'andrzej.nowak@wp.pl',
      phone: '123456789',
      seats: 3,
      rodo: true,
    });
    url = await driver.getCurrentUrl();
    url.should.equal(`http://localhost:3000/book/${id}`);
    await fillReservationForm(driver, id, {
      name: 'Andrzej',
      surname: 'Nowak',
      email: '',
      phone: '123456789',
      seats: 3,
      rodo: true,
    });
    url = await driver.getCurrentUrl();
    url.should.equal(`http://localhost:3000/book/${id}`);
    await fillReservationForm(driver, id, {
      name: 'Andrzej',
      surname: 'Nowak',
      email: 'andrzej.nowak@wp.pl',
      phone: '',
      seats: 3,
      rodo: true,
    });
    url = await driver.getCurrentUrl();
    url.should.equal(`http://localhost:3000/book/${id}`);
    await fillReservationForm(driver, id, {
      name: 'Andrzej',
      surname: 'Nowak',
      email: 'andrzej.nowak@wp.pl',
      phone: '123321123',
      seats: 'a',
      rodo: true,
    });
    url = await driver.getCurrentUrl();
    url.should.equal(`http://localhost:3000/book/${id}`);
    await fillReservationForm(driver, id, {
      name: 'Andrzej',
      surname: 'Nowak',
      email: 'andrzej.nowak@wp.pl',
      phone: '123321123',
      seats: 5,
      rodo: true,
    });
    url = await driver.getCurrentUrl();
    url.should.equal(`http://localhost:3000/book/${id}`);
    await fillReservationForm(driver, id, {
      name: 'Andrzej',
      surname: 'Nowak',
      email: 'andrzej.nowak@wp.pl',
      phone: '123321123',
      seats: 3,
      rodo: false,
    });
    url = await driver.getCurrentUrl();
    url.should.equal(`http://localhost:3000/book/${id}`);
  });

  it('check repeating email in form', async function () {
    this.timeout(3000);
    await fillRegisterForm(driver, {
      name: 'Andrzej',
      surname: 'Andrzej',
      email: 'andrzej@gmail.com',
      password: 'Andrzej',
    });
    const users = await db.users.findAll();
    users.should.have.length(1);
    await fillRegisterForm(driver, {
      name: 'Andrzej',
      surname: 'Andrzej',
      email: 'andrzej@gmail.com',
      password: 'Andrzej',
    });
    const els = await driver.findElements(By.className('error'));
    els.should.have.length(1);
    await takeScreenshot(driver, 'error-register.png');
  });

  it('login', async function () {
    await driver.get('localhost:3000/login');
    await driver.findElement(By.name('email')).sendKeys('andrzej@gmail.com');
    await driver.findElement(By.name('password')).sendKeys('Andrzej');
    await driver.findElement(By.name('submit')).click();
    await driver.wait(until.elementLocated(By.id('links')), TIMEOUT);
    const url = await driver.getCurrentUrl();
    url.should.equal('http://localhost:3000/user');
  });

  it('check correct form', async function () {
    this.timeout(3000);
    const trips = await getTripsFromDb(db);
    should.exist(trips.length);
    trips.length.should.be.at.least(1);
    should.exist(trips[0].id);
    const { id } = trips[0];
    await fillReservationForm(driver, id, {
      name: 'Andrzej',
      surname: 'Nowak',
      email: 'andrzej.nowak@wp.pl',
      phone: '123456789',
      seats: 3,
      rodo: true,
    });
    await driver.wait(until.elementLocated(By.className('info')), TIMEOUT);
    const url = await driver.getCurrentUrl();
    url.should.equal(`http://localhost:3000/book-success/${id}`);
  });

  it('reservation should appear on users page', async function () {
    await driver.get('localhost:3000/user');
    const reservations = await driver.findElements(By.id('reservation_description'));
    reservations.should.have.length(1);
  });

  it('logout', async function () {
    await driver.get('localhost:3000/user');
    const buttons = driver.findElement(By.id('links'));
    await buttons.findElement(By.css('a')).click();
    await driver.wait(until.elementLocated(By.id('trips')), TIMEOUT);
    const url = await driver.getCurrentUrl();
    url.should.equal('http://localhost:3000/abcd');
  });

  after(async function () {
    appHandle.close();
    await driver.quit();
  });
});
