const {
  expect
} = require('chai');
const sinon = require('sinon');
require('sinon-mongoose');

const faker = require('faker');
const User = require('../models/User');

const Question = require('../models/Question');

describe('User Model', () => {
  it('should create a new user', (done) => {
    const UserMock = sinon.mock(new User({
      username: 'test_user',
      profile: {
        name: 'Test User'
      }
    }));
    const user = UserMock.object;

    UserMock
      .expects('save')
      .yields(null);

    user.save((err) => {
      UserMock.verify();
      UserMock.restore();
      expect(err).to.be.null;
      done();
    });
  });

  it('should return error if user is not created', (done) => {
    const UserMock = sinon.mock(new User({
      username: 'test_user'
    }));
    const user = UserMock.object;
    const expectedError = {
      name: 'ValidationError'
    };

    UserMock
      .expects('save')
      .yields(expectedError);

    user.save((err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.name).to.equal('ValidationError');
      expect(result).to.be.undefined;
      done();
    });
  });

  it('should not create a user with the unique username', (done) => {
    const UserMock = sinon.mock(User({
      username: 'test_user'
    }));
    const user = UserMock.object;
    const expectedError = {
      name: 'MongoError',
      code: 11000
    };

    UserMock
      .expects('save')
      .yields(expectedError);

    user.save((err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.name).to.equal('MongoError');
      expect(err.code).to.equal(11000);
      expect(result).to.be.undefined;
      done();
    });
  });

  it('should find user by username', (done) => {
    const userMock = sinon.mock(User);
    const expectedUser = {
      username: 'test_user'
    };

    userMock
      .expects('findOne')
      .withArgs({
        username: 'test_user'
      })
      .yields(null, expectedUser);

    User.findOne({
      username: 'test_user'
    }, (err, result) => {
      userMock.verify();
      userMock.restore();
      expect(result.username).to.equal('test_user');
      done();
    });
  });

  it('should remove user by username', (done) => {
    const userMock = sinon.mock(User);
    const expectedResult = {
      nRemoved: 1
    };

    userMock
      .expects('remove')
      .withArgs({
        username: 'test_user'
      })
      .yields(null, expectedResult);

    User.remove({
      username: 'test_user'
    }, (err, result) => {
      userMock.verify();
      userMock.restore();
      expect(err).to.be.null;
      expect(result.nRemoved).to.equal(1);
      done();
    });
  });
});

describe('Generate fake data', () => {
  it('should generate fake questions', async (done) => {
    for (let i = 0; i < 10; i++) {
      const question = new Question({
        title: faker.name.title(),
        answers: [{
          title: faker.name.findName(),
          is_true: true
        }, {
          title: faker.name.findName(),
          is_true: false
        }, {
          title: faker.name.findName(),
          is_true: false
        }, {
          title: faker.name.findName(),
          is_true: false
        }],
        status: true
      });
      question.save();
    }
    done();
  });
});
