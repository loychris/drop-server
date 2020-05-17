
const HttpError = require('../models/http-error');
const { checkValidation, handleExists, emailExists } = require('../util/util');

const User = require('../models/user'); 
const Comment = require('../models/comment');

const signup = async (req, res, next) => {
  checkValidation(req, next);
  const { name, email, handle, password } = req.body;
  let user;
  try{
    user = await User.findOne({handle: handle})
  }catch(err){
    return next(new HttpError('Register User failed, please try again later.', 500));
  }
  if(user){
    return next(new HttpError(`Handle already taken. Please try another.`, 422));
  }  
  try{
    user = await User.findOne({email: email})
  }catch(err){
    return next(new HttpError('Register User failed, please try again later.', 500));
  }
  if(user){
    return next(new HttpError(`There already exists an account with your email. Please log in or choose another email.`, 422))
  }
  let createdUser =  new User({
    name,
    email,
    handle,
    password,
    createdDrops: [],
    writtenComments: []
  });
  try{
      await createdUser.save()
  } catch(err) {
      return next(new HttpError('Register User failed, please try again later.', 500))
  }
  res.status(201).json({ user: createdUser });
}


const login = async (req, res, next) => {
  const { identification, password } = req.body;

  let existingUser;
  if(identification.startsWith('@')){
    try {
      existingUser = await User.findOne({ handle: identification })
    } catch (err) {
      return next(new HttpError('Logging in failed, please try again later.', 500));
    }
  }else{
    try {
      existingUser = await User.findOne({ email: identification })
    } catch (err) {
      return next(new HttpError('Logging in failed, please try again later.', 500));
    }
  }
  if (!existingUser || existingUser.password !== password) {
    return next(new HttpError('Invalid credentials, could not log you in.', 401));
  }
  res.json({message: 'Logged in!'});
};

exports.signup = signup;
exports.login = login;