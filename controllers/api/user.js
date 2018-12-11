const User = require('../../models/User');

exports.info = async (req, res) => {
  const user = await User.find({
    mobile: req.body.mobile
  }).exec();
  if (user) {
    res.status(200).json({
      user
    });
  }
  res.status(404).json({
    message: 'not found'
  });
};
