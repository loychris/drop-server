const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');

const prepareComment = (comment) => {
  const {
    author,
    cID,
    upvoters,
    downvoters,
    actualComment,
    subComments,
  } = comment;

  return {
    author,
    cID,
    points: upvoters.length - downvoters.length,
    actualComment,
    subComments,
  };
};


const checkValidation = (req, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }
}

exports.checkValidation = checkValidation;
exports.prepareComment = prepareComment;


