const request = require('supertest');
const app = require('../app.js');

const User = require('../models/User');

describe('GET /', () => {
  it('should return 404 Not Found', (done) => {
    request(app)
      .get('/')
      .expect(404, done);
  });
});

const mobile1 = process.hrtime()[1].toString();
const mobile2 = process.hrtime()[1].toString();
const mobile3 = process.hrtime()[1].toString();
const mobile4 = process.hrtime()[1].toString();

describe('Success authenticate', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .post('/api/authenticate')
      .send({
        mobile: mobile1
      })
      .expect(200, done);
  });
  it('should return 200 OK', (done) => {
    request(app)
      .post('/api/authenticate')
      .send({
        mobile: mobile2
      })
      .expect(200, done);
  });
  it('should return 200 OK', (done) => {
    request(app)
      .post('/api/authenticate')
      .send({
        mobile: mobile3
      })
      .expect(200, done);
  });
  it('should return 200 OK', (done) => {
    request(app)
      .post('/api/authenticate')
      .send({
        mobile: mobile4
      })
      .expect(200, done);
  });
});

describe('Fail confirm authenticate: Invalid OTP Code', () => {
  it('should return 422 Validation Error', (done) => {
    request(app)
      .post('/api/authenticate/confirm')
      .send({
        mobile: mobile1,
        otp_code: '1111'
      })
      .expect(422, done);
  });
});

describe('Success confirm authenticate', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .post('/api/authenticate/confirm')
      .send({
        mobile: mobile1,
        otp_code: '1234'
      })
      .expect(200, done);
  });
  it('should return 200 OK', (done) => {
    request(app)
      .post('/api/authenticate/confirm')
      .send({
        mobile: mobile2,
        otp_code: '1234'
      })
      .expect(200, done);
  });
  it('should return 200 OK', (done) => {
    request(app)
      .post('/api/authenticate/confirm')
      .send({
        mobile: mobile3,
        otp_code: '1234'
      })
      .expect(200, done);
  });
  it('should return 200 OK', (done) => {
    request(app)
      .post('/api/authenticate/confirm')
      .send({
        mobile: mobile4,
        otp_code: '1234'
      })
      .expect(200, done);
  });
});

describe('Fail get user: Unathorized', () => {
  it('should return 401 Unathorized', (done) => {
    request(app)
      .get('/api/authenticate/user')
      .expect(401, done);
  });
});

describe('Success get user', () => {
  it('should return 200 OK', (done) => {
    User.findOne().select('+token').exec((err, user) => {
      console.log(user);
      if (!err) {
        request(app)
          .get('/api/authenticate/user')
          .set('Authorization', `Bearer ${user.token}`)
          .expect(200, done);
      }
    });
  });
});

describe('Fail edit profile', () => {
  it('should return 422 Validation Error', (done) => {
    User.findOne().select('+token').exec((err, user) => {
      if (!err) {
        request(app)
          .post('/api/profile/edit')
          .set('Authorization', `Bearer ${user.token}`)
          .expect(422, done);
      }
    });
  });
});

describe('Success edit profile', () => {
  it('should return 200 OK', (done) => {
    User.findOne().select('+token').exec((err, user) => {
      if (!err) {
        request(app)
          .post('/api/profile/edit')
          .set('Authorization', `Bearer ${user.token}`)
          .send({
            name: 'Name'
          })
          .expect(200, done);
      }
    });
  });
});
