
const Isemail = require('isemail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

const HttpError = require('../models/http-error');
const { checkValidation, prepareUserData, prepareSelf, prepareChat } = require('../util/util');
const User = require('../models/user-schema'); 
const Chat = require('../models/chat-schema'); 

const signup = async (req, res, next) => {
  checkValidation(req, next);
  const { name, email, handle, password } = req.body;
  let user;

  console.log(req.file);

  //check handle
  try{
    user = await User.findOne({handle: handle})
  }catch(err){ return next(new HttpError('Register User failed, please try again later.', 500))}
  if(user){    return next(new HttpError(`Handle already taken. Please try another.`, 422))}  

  //check email
  try{
    user = await User.findOne({email: email})
  }catch(err){ return next(new HttpError('Register User failed, please try again later.', 500))}
  if(user){    return next(new HttpError(`There already exists an account with your email. Please log in or choose another email.`, 422))}

  //create password hash
  let hashedPassword;
  try{
    hashedPassword = await bcrypt.hash(password, 12); 
  }catch(err){ return next(new HttpError('Could not create User, please try again', 500))}

  //create user 
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
    writtenComments: [],
    friends: [],
    receivedFriendRequests: [],
    sentFriendRequests: [],
    profilePic: req.file ? true : false
  });

  //upload ProfilePic
  if(req.file){
    const storage = new Storage({
      keyFilename: path.join(__dirname, '../drop-260521-cc0eb8f443d7.json'),
      projectId: 'drop-260521'
    });
    const profilePictureBucket = storage.bucket('drop-profile-pictures-bucket')

    const gcsname = `profilePic-${createdUser._id}`;
    const file = profilePictureBucket.file(gcsname);
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      },
      resumable: false
    });
    stream.on('error', (err) => {
      req.file.cloudStorageError = err;
      next(err);
    });
    stream.on('finish', () => {
      console.log('/////////////');
      console.log(`uploaded ${gcsname} to drop-profile-pictures-bucket`);
      console.log('/////////////');
      req.file.cloudStorageObject = gcsname;
    });
    stream.end(req.file.buffer);
    createdUser.profilePic = true;
  }
  try{

      await createdUser.save()
  }catch(err){ return next(new HttpError('Register User failed, please try again later.', 500))}
  let token;
  try{
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'supersecret_private_key_dont_share',
      { expiresIn: '672h' }
    );
  }catch(err){ return next(new HttpError('Register User failed, please try again later.', 500))}

  const preparedUser = prepareSelf(createdUser, token);

  res.status(201).json(preparedUser);
}

//-----------------------------------------------------------------------------------


const login = async (req, res, next) => {
  const { identification, password } = req.body;

  let existingUser;
  if(Isemail.validate(identification)){
    try {
      existingUser = await User.
        findOne({ email: identification })
        .populate({path: 'receivedFriendRequests', model: 'User'})
        .populate({path: 'sentFriendRequests', model: 'User'})
        .populate({path: 'friends', model: 'User'})
        .populate({path: 'chats', model: 'Chat', populate: 'members'})
    }catch(err){ 
      return next(new HttpError('Logging in failed, please try again later.', 500))
    }
  }else{
    let handle = identification
    if(!identification.startsWith('@')) handle = `@${identification}`;
    try{
      existingUser = await User.findOne({ handle: handle })
    }catch(err){ 
      return next(new HttpError('Logging in failed, please try again later.', 500))
    }
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  }catch(err){ 
    return next(new HttpError('Could not log you in please check your credentials and try again', 500))
  }
  if(!isValidPassword){ 
    return next(new HttpError('Email or Password wrong', 401))
  }

  let token;
  try{
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'supersecret_private_key_dont_share',
      { expiresIn: '672h' }
    );
  }catch(err){ 
    return next(new HttpError('Register User failed, please try again later.', 500))
  }
  const preparedUser = prepareSelf(existingUser, token)
  res.json(preparedUser)
};

//-----------------------------------------------------------------------------------

const refreshSelf = async (req, res, next) => {
  const userId = req.userData.userId;
  let self;
  try {
    self = await User.findById(userId)
      .populate({path: 'receivedFriendRequests', model: 'User'})
      .populate({path: 'sentFriendRequests', model: 'User'})
      .populate({path: 'friends', model: 'User'})
      .populate({path: 'chats', model: 'Chat', populate: 'members'})
  }catch(err){ 
    console.log(err);
    return next(new HttpError('Refresh Userdata failed. Try again later', 500))
  }
  if(!self){
    return next(new HttpError('No User foud for id', 404));
  }
  let token;
  try{
    token = jwt.sign(
      { userId, email: self.email },
      'supersecret_private_key_dont_share',
      { expiresIn: '672h' }
    );
  }catch(err){ 
    return next(new HttpError('Register User failed, please try again later.', 500))
  }
  const preparedSelf = prepareSelf(self, token);
  res.json(preparedSelf);
}
//-----------------------------------------------------------------------------------


const checkHandle = async (req, res, next) => {
  const handle = req.body.handle;
  let user;
  try {
    user = await User.findOne({ handle: handle })
  } catch (err) {
    return next(new HttpError('Checking handle failed, please try again later.', 500))
  }
  if(user){
    res.status(422).json({alreadyExists: true}); 
  }else{
    res.json({handleExists: false});
  }
}

//-----------------------------------------------------------------------------------


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

//-----------------------------------------------------------------------------------


const getAllUsers = async (req, res, next) => {
  let users;
  try{
    users = await User.find({}).select('name handle profilePic');
  }catch(err){
    return next(new HttpError("Something went wrong. Please try again", 500));
  }
  const preparedUsers = users.map(prepareUserData);
  res.json(preparedUsers);
}

//-----------------------------------------------------------------------------------


const getFriendRequests = async (req, res, next) => {
  const userId = req.userData.userId;
  let user;
  try{
    user = await User.findById(userId).populate("receivedFriendRequests").exec();
  }catch(err){
    console.log(err)
    return next(new HttpError('There was a problem while fetching the friendRequests', 500));
  }
  if(!user){ 
    return next(new HttpError('No user found for given id', 400))
  }
  const preparedRequests = user.receivedFriendRequests.map(prepareUserData);
  res.json(preparedRequests);
}

//-----------------------------------------------------------------------------------


const sendFriendRequest = async (req, res, next) => {
  const userId = req.userData.userId;
  const friendId = req.body.friendId; 
  let friend;
  let user;
  try { 
    user = await User.findById(userId) }
  catch(err){ return next(new HttpError("Something went wrong. Try again later", 500)) }   
  try {
    friend = await User.findById(friendId)
  }catch(err){ return next(new HttpError("Something went wrong. Try again later", 500)) }
  if(!friend){ return next(new HttpError("No user found with FriendId", 404)) }
  if(!friend.receivedFriendRequests.includes(userId)){ 
    friend.receivedFriendRequests.push(userId);
  }
  if(!user.sentFriendRequests.includes(friendId)){ 
    user.sentFriendRequests.push(friendId);
  }
  await friend.save();
  await user  .save();
  res.json({message: "Friend Request Sent!"})
}

//-----------------------------------------------------------------------------------


const acceptFriendRequest = async (req, res, next) => {
  const userId = req.userData.userId;
  const { friendId } = req.body;
  console.log(friendId);
  let user;
  try { 
    user = await User.findById(userId) }
  catch(err){  
    return next(new HttpError("Something went wrong. Try again later", 500)) 
  }   
  let friend;
  try { 
    friend = await User.findById(friendId) }
  catch(err){  
    return next(new HttpError("Something went wrong. Try again later", 500)) 
  } 
  if(!friend){ 
    return next(new HttpError("No user found with FriendId", 404)) 
  }
  if(!user.receivedFriendRequests.includes(friendId)){
    return next(new HttpError("No Friend Request found", 404));
  }
  if(!friend.sentFriendRequests.includes(userId)) {
    return next(new HttpError("No Friend Request found", 404));
  }
  const newChat = new Chat({
    group: false,
    members: [userId, friendId],
    admins: [userId, friendId],
    messages: [],
  })
  user.receivedFriendRequests.pull(friendId);
  user.friends.push(friendId);
  user.chats.push(newChat._id);
  friend.sentFriendRequests.pull(userId);
  friend.friends.push(userId);
  friend.chats.push(newChat._id);
  try{
    await friend.save();
    await user.save();
    await newChat.save();
  }catch(err){ 
    return next(new HttpError('Something went wrong while saving. Please try again later', 500))
  }
  const preparedFriend = prepareUserData(friend);
  const preparedChat = prepareChat(newChat);
  res.json({ friend: preparedFriend, chat: preparedChat});
}

//-----------------------------------------------------------------------------------


const getDataForUsers = async (req, res, next) => {
  const { userIds } = req.body;
  let users;
  try {
    users = await User.find().where('_id').in(userIds).exec();
  }catch(err){
    return next(new HttpError("Someting went wrong. Please try again later", 500));
  } 
  if(userIds.length !== users.length) console.log(`
    One or more Users werent found
    ${userIds}
    ${users}
  `)
  const preparedUsers = users.map(prepareUserData);
  res.json(preparedUsers);
}

exports.checkHandle = checkHandle;
exports.checkEmail = checkEmail;
exports.signup = signup;
exports.login = login;
exports.getAllUsers = getAllUsers;
exports.sendFriendRequest = sendFriendRequest;
exports.acceptFriendRequest = acceptFriendRequest;
exports.getDataForUsers = getDataForUsers;
exports.getFriendRequests = getFriendRequests;
exports.refreshSelf = refreshSelf;