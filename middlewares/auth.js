const jwt = require('jsonwebtoken');

const User = require('../models/User');

const methods = {
  unauthorized(res) {
    res.status(401).json({
      message: 'unauthorized'
    });
  },
  unauthorizedSocket(next) {
    const err = new Error('unauthorized');
    err.data = {
      type: 'unauthorized'
    };
    next(err);
  }
};

exports.isAuthenticated = async (req, res, next) => {
  const auth = req.headers ? req.headers.authorization || null : null;
  if (auth) {
    const parts = auth.split(' ');
    if (parts.length > 1) {
      const schema = parts.shift().toLowerCase();
      const token = parts.join(' ');
      if (schema === 'bearer') {
        try {
          const userId = await jwt.verify(token, process.env.APP_KEY);
          if (userId) {
            const user = await User.findById(userId).exec();
            if (user) {
              req.user = user;
              next();
              return;
            }
          }
        } catch (e) {
          methods.unauthorized(res);
          return;
        }
      }
    }
  }
  methods.unauthorized(res);
};

exports.isAuthenticatedSocket = (socket, next) => {
  const token = socket.handshake.query.token;
  if (token) {
    try {
      jwt.verify(token, process.env.APP_KEY, (err, userId) => {
        if (!err) {
          User.findById(userId, (er, user) => {
            if (!err) {
              socket.user = user;
              next();
            }
          });
        }
      });
    } catch (err) {
      methods.unauthorizedSocket(next);
      return;
    }
  }
  methods.unauthorizedSocket(next);
};
