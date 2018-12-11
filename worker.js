const jwt = require('jsonwebtoken');
const io = require('socket.io')(process.env.NODEJS_PORT);
const socketRedis = require('socket.io-redis');
const redis = require('redis');
const kue = require('kue');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const chalk = require('chalk');

dotenv.load({
  path: '.env'
});

// Connect redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

// Connect queue to redis
const queue = kue.createQueue({
  redis: process.env.REDIS_URL
});

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

const User = require('./models/User');
const Game = require('./models/Game');
const Question = require('./models/Question');
const LockyGame = require('./models/LockyGame');

io.adapter(socketRedis({
  url: process.env.REDIS_URL
}));

async function joinLuckyGame(data, done) {
  const opponent = await LockyGame.findOne({
    user: {
      $ne: data.user_id
    }
  }).exec();
  if (opponent) {
    await LockyGame.find({
      user: {
        $in: [data.user_id, opponent.user]
      }
    }).deleteMany().exec();
    const players = await User.where('_id').in([data.user_id, opponent.user]).exec();
    const questions = await Question.aggregate([{
      $sample: {
        size: 6
      }
    }, {
      $project: {
        _id: 1
      }
    }]).exec();
    const questionIds = questions.map(obj => obj._id);
    const game = new Game({
      players: [{
        user: players[0].id
      }, {
        user: players[1].id
      }],
      questions: questionIds
    });
    game.token = jwt.sign(game.id, process.env.APP_KEY);
    await game.save();
    for (let i = 0; i < players.length; i++) {
      redisClient.get(`user_${players[i].id}`, (err, socketId) => {
        if (!err) {
          io.to(socketId).emit('joined-game', {
            type: 'duel',
            game,
          });
          if (i === (players.length - 1)) {
            console.log(`done: emited ${process.hrtime()[1].toString()}`);
            done();
          }
        }
      });
    }
  } else {
    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    };
    const query = {
      user: data.user_id
    };
    const update = {
      user: data.user_id,
    };
    await LockyGame.findOneAndUpdate(query, update, options).exec();
    console.log(`done: no opponent ${process.hrtime()[1].toString()}`);
    done();
  }
}

queue.process('join-lucky-game', (job, done) => {
  joinLuckyGame(job.data, done);
});