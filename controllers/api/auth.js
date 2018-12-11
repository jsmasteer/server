const jwt = require('jsonwebtoken');
const User = require('../../models/User');

exports.user = async (req, res) => {
  const user = await User.findById(req.user.id).select('+token').exec();
  res.status(200).json({
    user
  });
};

exports.authenticate = async (req, res, next) => {
  if (!req.body.mobile) {
    res.status(422).json({
      message: 'mobile required'
    });
    return;
  }

  let user = await User.findOne({
    mobile: req.body.mobile
  }).exec();

  if (!user) {
    user = new User({
      mobile: req.body.mobile,
      avatar: 'https://placeimg.com/140/140/any'
    });
    user.token = jwt.sign(user.id, process.env.APP_KEY);
    await user.save();
  }
  await user.sendOTPCodeSMS(false);

  res.status(200).json({
    message: 'otp code sent via sms'
  });
};

exports.confirmAuthenticate = async (req, res, next) => {
  if (!req.body.mobile) {
    res.status(422).json({
      message: 'mobile required'
    });
    return;
  }
  if (!req.body.otp_code) {
    res.status(422).json({
      message: 'code required'
    });
    return;
  }

  const user = await User.findOne({
    mobile: req.body.mobile
  }).select('+token').exec();

  if (user) {
    if (await user.canVerifyOTPCode()) {
      if (await user.verifyOTPCode(req.body.otp_code)) {
        user.set({
          status: 1,
          mobile_status: 1
        });
        user.save();
        res.status(200).json({
          user
        });
        return;
      }
      res.status(422).json({
        message: 'invalid otp code'
      });
      return;
    }
    res.status(422).json({
      message: 'otp code limit',
      remain_time: user.getOTPCodeRemainTime()
    });
    return;
  }

  res.status(404).json({
    message: 'user not found'
  });
};
