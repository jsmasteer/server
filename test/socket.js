const {
  expect
} = require('chai');
const io = require('socket.io-client');
const async = require('async');

const User = require('../models/User');

const socketURL = `http://${process.env.NODEJS_IP}:${process.env.NODEJS_PORT}`;

describe('Unauthorized connection token not provided', () => {
  it('Should emit error type unauthorized', (done) => {
    const client = io(socketURL);

    client.on('error', (err) => {
      expect(err.type).to.equal('unauthorized');
      client.disconnect();
      done();
    });
  });
});

describe('Unauthorized connection invalid token', () => {
  it('Should emit error type unauthorized', (done) => {
    const client = io(`${socketURL}?token=invalid_token`);

    client.on('error', (err) => {
      expect(err.type).to.equal('unauthorized');
      client.disconnect();
      done();
    });
  });
});

describe('Successful connection', () => {
  it('Should emit connected', (done) => {
    User.findOne().select('+token').exec((err, user) => {
      if (!err) {
        const client = io(`${socketURL}?token=${user.token}`);

        client.on('connected', (data) => {
          expect(data.message).to.equal('connected');
          client.disconnect();
          done();
        });
      }
    });
  });
});

describe('Join 2 player to game in different time', () => {
  it('Should emit joined-game to users', (done) => {
    User.find().select('+token').limit(2).exec((err, users) => {
      if (!err) {
        const client1 = io(`${socketURL}?token=${users[0].token}`);
        const client2 = io(`${socketURL}?token=${users[1].token}`);

        client1.emit('join-lucky-game', () => {});
        setTimeout(() => {
          client2.emit('join-lucky-game', () => {});
        }, 1000);

        client1.on('joined-game', () => {
          client2.on('joined-game', () => {
            client1.disconnect();
            client2.disconnect();
            done();
          });
        });

        client2.on('joined-game', () => {
          client1.on('joined-game', () => {
            client1.disconnect();
            client2.disconnect();
            done();
          });
        });
      }
    });
  });
});

describe('Join 2 player to game in same time', () => {
  it('Should emit joined-game to users', (done) => {
    User.find().select('+token').limit(2).exec((err, users) => {
      if (!err) {
        const client1 = io(`${socketURL}?token=${users[0].token}`);
        const client2 = io(`${socketURL}?token=${users[1].token}`);

        async.parallel({
          user1: () => {
            client1.emit('join-lucky-game', () => {});
          },
          user2: () => {
            client2.emit('join-lucky-game', () => {});
          }
        });

        client1.on('joined-game', () => {
          client2.on('joined-game', () => {
            client1.disconnect();
            client2.disconnect();
            done();
          });
        });

        client2.on('joined-game', () => {
          client1.on('joined-game', () => {
            client1.disconnect();
            client2.disconnect();
            done();
          });
        });
      }
    });
  });
});

describe('Join 3 player to game in same time', () => {
  it('Should emit joined-game to users', (done) => {
    User.find().select('+token').limit(3).exec((err, users) => {
      if (!err) {
        const client = io(`${socketURL}?token=${users[0].token}`);
        const client1 = io(`${socketURL}?token=${users[1].token}`);
        const client2 = io(`${socketURL}?token=${users[2].token}`);

        async.parallel({
          user: () => {
            client.emit('join-lucky-game', () => {});
          },
          user1: () => {
            client1.emit('join-lucky-game', () => {});
          },
          user2: () => {
            client2.emit('join-lucky-game', () => {});
          }
        });

        client.on('joined-game', () => {
          client1.on('joined-game', () => {
            done();
          });
        });

        client1.on('joined-game', () => {
          client.on('joined-game', () => {
            client.disconnect();
            client1.disconnect();
            done();
          });
        });

        client.on('joined-game', () => {
          client2.on('joined-game', () => {
            client.disconnect();
            client2.disconnect();
            done();
          });
        });

        client2.on('joined-game', () => {
          client.on('joined-game', () => {
            client.disconnect();
            client2.disconnect();
            done();
          });
        });

        client1.on('joined-game', () => {
          client2.on('joined-game', () => {
            client1.disconnect();
            client2.disconnect();
            done();
          });
        });

        client2.on('joined-game', () => {
          client1.on('joined-game', () => {
            client1.disconnect();
            client2.disconnect();
            done();
          });
        });
      }
    });
  });
});

describe('Join 2 player to game in same time when one player waiting for opponent', () => {
  it('Should emit joined-game to users', (done) => {
    User.find().select('+token').limit(3).exec((err, users) => {
      if (!err) {
        const client = io(`${socketURL}?token=${users[0].token}`);
        const client1 = io(`${socketURL}?token=${users[1].token}`);
        const client2 = io(`${socketURL}?token=${users[2].token}`);

        client.emit('join-lucky-game', () => {});
        setTimeout(() => {
          async.parallel({
            user1: () => {
              client1.emit('join-lucky-game', () => {});
            },
            user2: () => {
              client2.emit('join-lucky-game', () => {});
            }
          });
        }, 1000);

        client.on('joined-game', () => {
          client1.on('joined-game', () => {
            client.disconnect();
            client1.disconnect();
            done();
          });
        });

        client1.on('joined-game', () => {
          client.on('joined-game', () => {
            client.disconnect();
            client1.disconnect();
            done();
          });
        });

        client.on('joined-game', () => {
          client2.on('joined-game', () => {
            client.disconnect();
            client2.disconnect();
            done();
          });
        });

        client2.on('joined-game', () => {
          client.on('joined-game', () => {
            client.disconnect();
            client2.disconnect();
            done();
          });
        });

        client1.on('joined-game', () => {
          client2.on('joined-game', () => {
            client1.disconnect();
            client2.disconnect();
            done();
          });
        });

        client2.on('joined-game', () => {
          client1.on('joined-game', () => {
            client1.disconnect();
            client2.disconnect();
            done();
          });
        });
      }
    });
  });
});
