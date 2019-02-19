const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  mobile: {
    type: String,
    unique: true,
    required: true
  },
  otp_code: {
    type: String,
    select: false
  },
  otp_code_created_at: {
    type: Number,
    required: false,
    default: 0,
    select: false
  },
  otp_code_max_count: {
    type: Number,
    required: false,
    default: 0,
    select: false
  },
  otp_code_wrong_count: {
    type: Number,
    required: false,
    default: 0,
    select: false
  },
  otp_code_last_wrong_at: {
    type: Number,
    required: false,
    default: 0,
    select: false
  },
  token: {
    type: String,
    select: false
  },
  status: Number,
  mobile_status: {
    type: Boolean,
    default: false
  },
  name: String,
  avatar: {
    type: String,
    default: 'https://placeimg.com/140/140/any'
  },
  bio: String
}, {
  timestamps: true
});

UserSchema.methods.canVerifyOTPCode = async function canVerifyOTPCode() {
  const user = await this.model('User').findById(this.id).select('+otp_code_wrong_count +otp_code_last_wrong_at').exec();

  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  if (user.otp_code_wrong_count > 2) {
    const remain = (2 * 60) - ((new Date()).getTime() - user.otp_code_last_wrong_at);
    if (remain > 0) {
      return false;
    }
    user.otp_code_wrong_count = 0;
    await user.save();
  }
  return true;
};

UserSchema.methods.verifyOTPCode = async function verifyOTPCode(code) {
  const user = await this.model('User').findById(this.id).select('+otp_code +otp_code_created_at +otp_code_wrong_count +otp_code_max_count +otp_code_last_wrong_at').exec();
  if (user.otp_code === code) {
    user.set({
      otp_code: null,
      otp_code_created_at: 0,
      otp_code_max_count: 0,
      otp_code_last_wrong_at: 0,
    });
    await user.save();
    return true;
  }
  user.set({
    otp_code_wrong_count: user.otp_code_max_count + 1,
    otp_code_max_count: user.otp_code_max_count + 1,
    otp_code_last_wrong_at: (new Date()).getTime(),
  });
  await user.save();
  return false;
};

UserSchema.methods.getOTPCodeRemainTime = async function getOTPCodeRemainTime() {
  const user = await this.model('User').findById(this.id).select('+otp_code_created_at').exec();

  const remain = 120 - (new Date()).getTime() - user.otp_code_created_at;
  if (remain > 0) {
    return remain;
  }

  return 0;
};

UserSchema.methods.sendOTPCodeSMS = async function sendOTPCodeSMS(status) {
  const user = await this.model('User').findById(this.id).select('+otp_code +otp_code_created_at').exec();

  if (process.env.NODE_ENV === 'development') {
    user.set({
      otp_code: 1234,
      otp_code_created_at: (new Date()).getTime()
    });
    if (status) {
      user.set({
        mobile_status: 0,
      });
    }
    await user.save();

    return true;
  }

  if (((new Date()).getTime() - this.otp_code_created_at) >= 120) {
    this.set({
      otp_code: 1234,
      otp_code_created_at: (new Date()).getTime()
    });
    if (status) {
      this.set({
        mobile_status: 0,
      });
    }
    await this.save();

    // send sms

    return true;
  }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
