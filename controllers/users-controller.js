
const Isemail = require('isemail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const { checkValidation } = require('../util/util');
const User = require('../models/user'); 

const signup = async (req, res, next) => {
  checkValidation(req, next);
  const { name, email, handle, password } = req.body;
  const date = new Date();
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
  let hashedPassword;
  try{
    hashedPassword = await bcrypt.hash(password, 12); 
  }catch(err){
    return next(new HttpError('Could not create User, please try again', 500));
  }

  let createdUser =  new User({
    name,
    email,
    handle,
    password: hashedPassword,
    joined: new Date(),
    createdDrops: [],
    swipedLeftDrops: [],
    swipedRightDrops: [],
    savedDrops: [],
    writtenComments: []
  });
  try{
      await createdUser.save()
  } catch(err) {
      return next(new HttpError('Register User failed, please try again later.', 500))
  }

  let token;
  try{
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'supersecret_private_key_dont_share',
      { expiresIn: '1h' }
    );
  }catch(err){
    return next(new HttpError('Register User failed, please try again later.', 500))
  }


  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
}

const login = async (req, res, next) => {
  const { identification, password } = req.body;

  let existingUser;
  if(Isemail.validate(identification)){
    try {
      existingUser = await User.findOne({ email: identification })
    } catch (err) {
      return next(new HttpError('Logging in failed, please try again later.', 500));
    }
  } else {
    let handle = identification
    if(!identification.startsWith('@')) handle = `@${identification}`;
    try {
      existingUser = await User.findOne({ handle: handle })
    } catch (err) {
      return next(new HttpError('Logging in failed, please try again later.', 500));
    }
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  }catch(err){
    return next(new HttpError('Could not log you in please check your credentials and try again', 500)); 
  }
  if(!isValidPassword){
    return next(new HttpError('Invalid Credentials, could not log you in.', 401));
  }

  let token;
  try{
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'supersecret_private_key_dont_share',
      { expiresIn: '1h' }
    );
  }catch(err){
    return next(new HttpError('Register User failed, please try again later.', 500))
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  });
};

const checkHandle = async (req, res, next) => {
  const handle = req.body.handle;
  let user;
  try {
    user = await User.findOne({ handle: handle })
  } catch (err) {
    return next(new HttpError('Checking handle failed, please try again later.', 500));
  }
  if(user){
    res.status(422).json({alreadyExists: true}); 
  }else{
    res.json({handleExists: false});
  }
}

const checkEmail = async (req, res, next) => {
  checkValidation(req, next);
  const email = req.body.email;
  let user;
  try {
    user = await User.findOne({ email: email })
  } catch (err) {
    return next(new HttpError('Checking email failed, please try again later.', 500));
  }
  if(user){
    res.status(422).json({alreadyExists: true}); 
  }else{
    res.json({emailExists: false});
  }
}



exports.checkHandle = checkHandle;
exports.checkEmail = checkEmail;
exports.signup = signup;
exports.login = login;