const express = require('express');

const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const chalk = require('chalk');
const redis = require('socket.io-redis');
const io = require('socket.io')(http);

dotenv.load({
  path: '.env'
});

// Controllers
const errorController = require('./controllers/api/error');
const authController = require('./controllers/api/auth');
const profileController = require('./controllers/api/profile');
const gameController = require('./controllers/api/game');

const connectionSocketController = require('./controllers/socket/connection');
const gameSocketController = require('./controllers/socket/game');

// Middlewares
const authMiddleware = require('./middlewares/auth');

// Connect to MongoDB
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

// Express configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.set('host', process.env.NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.NODEJS_PORT || 8080);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(expressValidator());

// Routes
app.get('/', errorController.notFound);
app.post('/api/authenticate', authController.authenticate);
app.post('/api/authenticate/confirm', authController.confirmAuthenticate);
app.get('/api/authenticate/user', authMiddleware.isAuthenticated, authController.user);
app.post('/api/profile/edit', authMiddleware.isAuthenticated, profileController.edit);
app.post('/api/game/info', authMiddleware.isAuthenticated, gameController.info);

// Socket
io.adapter(redis({
  url: process.env.REDIS_URL
}));
io.use(authMiddleware.isAuthenticatedSocket);
io.on('connect', (socket) => {
  connectionSocketController.connect(io, socket);
  socket.on('join-lucky-game', () => {
    gameSocketController.joinLuckyGame(io, socket);
  });
  socket.on('play', (data) => {
    gameSocketController.play(io, socket, data);
  });
});

// Error Handler
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

// Start Express server
http.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
