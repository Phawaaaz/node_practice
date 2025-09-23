const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role || 'user',
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  const correct = user.correctPassword(password, user.password);

  // console.log(user);
  if (!user || !correct) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3) If everything ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Steps
  // 1) get the token and check if its exist
  // 2) validate the token (verification)
  // 3)if the verification is successfull check if the user exist
  // 4)check if user change password after the the token was issued

  // 1) get the token and check if its exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! please login to get access', 401),
    );
  }
  console.log(req.headers);
  // 2) validate the token (verification)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3)if the verification is successfull check if the user exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token  no longer exist', 401),
    );
  }
  // 4)check if user change password after the the token was issued
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed Password!, Please login again', 401),
    );
  }

  // Grant access
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on Posted email
  // 2) Generate the random reset token
  // 3) Send it to user's email

  // 1) Get user based on Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and 
  passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token generated
  // 2) If token has not expired, and there is user, set the new password
  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in send jwt

  // 1) Get user based on the token generated
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest(hex);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    // checkif password reset is greater than rn,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  // 3) Update changedPasswordAt property for the user
  // send the password to the user and the db
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // We delete the token and expiry date after resetting the password
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // save the user
  await user.save();
  // 4) Log the user in send jwt
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  }); 
});
