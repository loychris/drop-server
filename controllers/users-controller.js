
const HttpError = require('../models/http-error');
const { checkValidation } = require('../util/util');

const User = require('../models/user'); 
const Comment = require('../models/comment');

const registerUser = async (req, res, next) => {
    checkValidation(req, next);
    const { name, email, password } = req.body;
    const createdUser =  new User({
        name,
        email,
        password,
        createdDrops: [],
        writtenComments: []
    })
    try{
        await createdUser.save()
    } catch(err) {
        return next(new HttpError('Register User failed, please try again later.', 500))
    }
    res.status(201).json({ user: createdUser });
}


const login = async (req, res, next) => {
    const { email, password } = req.body;
  
    let existingUser;
  
    try {
      existingUser = await User.findOne({ email: email })
    } catch (err) {
      const error = new HttpError(
        'Logging in failed, please try again later.',
        500
      );
      return next(error);
    }
  
    if (!existingUser || existingUser.password !== password) {
      const error = new HttpError(
        'Invalid credentials, could not log you in.',
        401
      );
      return next(error);
    }
  
    res.json({message: 'Logged in!'});
  };

exports.registerUser = registerUser;
exports.login = login;