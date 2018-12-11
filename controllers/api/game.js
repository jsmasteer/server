const Game = require('../../models/Game');

exports.info = async (req, res, next) => {
  req.assert('id', 'id cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    res.status(422).json(errors);
    return;
  }

  const game = await Game.findOne({
    _id: req.body.id,
    players: {
      $elemMatch: {
        user: req.user.id
      }
    }
  }).populate('players.user').populate('questions');
  if (game) {
    res.status(200).json({
      game
    });
  } else {
    res.status(404).json({
      error: 'not found'
    });
  }
};
