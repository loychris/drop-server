const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

exports.checkAuth = (req, res, next) => {
    if (req.method === 'OPTIONS') {
      return next();
    }
    try {
      const token = req.headers.authorization.split(' ')[1]
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      req.userData = { userId: decodedToken.userId }
  } catch (err) {
      return next(new HttpError('Authentification failed!', 401));
  }
  next();
};

exports.checkOptionalAuth = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  if(!req.headers.authorization) {
      next()
  }else {
      try {
          const token = req.headers.authorization.split(' ')[1]
          const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
          req.userData = { userId: decodedToken.userId }
      } catch (err) {
          return next(new HttpError('Authentification failed!', 401));
      }
      next();
  }
};


// Middleware for admin authentication
exports.checkAdminAuth = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = { userId: decodedToken.userId };

    // Check if the user is an admin based on the 'admin' field in the user schema
    if (!decodedToken.admin) {
      return next(new HttpError('Unauthorized. Admin access required.', 403));
    }
  } catch (err) {
    return next(new HttpError('Authentication failed!', 401));
  }
  next();
};