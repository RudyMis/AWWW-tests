/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import { getDBLocal } from '../database/db.mjs';
import { sampleTrip } from '../database/create_trip.mjs';
import app from '../app.mjs';

should = chai.should();
chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('User chai-http', function () {
  let db = {};
  let appHandle = {};
  let agent = {}; // retain session

  before(async function () {
    db = await getDBLocal();
    await sampleTrip(db);
    appHandle = app(db);
    agent = chai.request.agent('http://localhost:3000');
  });

  after(function () {
    appHandle.close();
  });

  it('register', async function () {
    await agent.post('/register').type('form')
      .send({
        email: 'abc@abc.com',
        first_name: 'Andrzej',
        last_name: 'Andrzej',
        password: 'Andrzej',
        confirm_password: 'Andrzej',
      });
    await expect(db.users.findAll()).to.eventually.have.length(1);
  });

  it('login - bad password', async function () {
    await agent.post('/login').type('form')
      .send({
        email: 'abc@abc.com',
        password: 'Nieandrzej',
      });
    await agent.get('/user').then(function (res) {
      expect(res).to.redirectTo('http://localhost:3000/login');
    });
  });

  it('login', async function () {
    await agent.post('/login').type('form')
      .send({
        email: 'abc@abc.com',
        password: 'Andrzej',
      })
      .then(function (res) {
        expect(res).to.redirectTo('http://localhost:3000/user');
      });
  });

  it('auto redirect from login to user', async function () {
    await agent.get('/login')
      .then(function (res) {
        expect(res).to.redirectTo('http://localhost:3000/user');
      });
  });
});
