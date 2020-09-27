const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
      return next();
    }
    if(!req.headers.authorisation) {
        next()
    }else {
        try {
            const token = req.headers.authorisation.split(' ')[1]
            const decodedToken = jwt.verify(token, 'supersecret_private_key_dont_share');
            req.userData = { userId: decodedToken.userId }
        } catch (err) {
            return next(new HttpError('Authentification failed!', 401));
        }
        next();
    }
  };