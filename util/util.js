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

const checkUser = async (creator) => {
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }
  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }
  return user; 
}

const handleExists = async (handle, next) => {
  if(handle.trim().startsWith('@')){
    let user;
    try{
      user = await User.findOne({handle: handle.trim()})
    }catch(err){
      return next(new HttpError(`Checking if ${handle} already exists failed. Please try again later.`, 500))
    }
    console.log(user)
    if(user){return true }else {return  false};  
  }else {
    return next(new HttpError("Invalid handle input. Please check your data", 422))
  }
}

const emailExists = async (email, next) => {
    let user;
    try{
      user = await User.findOne({email: email})
    }catch(err){
      return next(new HttpError(`Checking if email already exists failed. Please try again later.`, 500))
    }
    return user ? true : false; 
}

const checkValidation = (req, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
}

exports.emailExists = emailExists;
exports.handleExists = handleExists;
exports.checkUser = checkUser;
exports.checkValidation = checkValidation;
exports.prepareComment = prepareComment;


