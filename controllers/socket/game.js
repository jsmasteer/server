const jwt = require('jsonwebtoken');
const kue = require('kue');

const queue = kue.createQueue({
  redis: process.env.REDIS_URL
});

const User = require('../../models/User');
const Game = require('../../models/Game');

exports.joinLuckyGame = async (io, socket) => {
  queue.create('join-lucky-game', {
    user_id: socket.user.id,
    socket_id: socket.id
  }).priority('high').save();
  socket.emit('waiting-for-opponent');
};

exports.play = async (io, socket, data) => {
  const game = await getGame(socket, data);
  if (game) {
    
  }
  gameNotFound(socket);
};

async function getGame(socket, data) {
  const token = data.game_token;
  if (token) {
    try {
      await jwt.verify(token, process.env.APP_KEY, async (err, gameId) => {
        if (!err) {
          await Game.findById(gameId, (er, game) => {
            if (!err) {
              let isMemberOfGame = false;
              for (let i = 0; i < game.players.length; i++) {
                if (game.players[i].user == socket.user.id) {
                  isMemberOfGame = true;
                }
              }
              if (isMemberOfGame) {
                return game;
              }
            }
          });
        }
      });
    } catch (err) {
      return false;
    }
  }
  return false;
}

function gameNotFound(socket) {
  const err = new Error('not found');
  err.data = {
    type: 'not found'
  };
  socket.emit(err);
}
