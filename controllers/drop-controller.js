const { validationResult } = require("express-validator");
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const { prepareDrop, prepareComment } = require("../util/util");
const Drop = require("../models/drop-schema");
const { User, Notification } = require('../models/user-schema');
const Comment = require('../models/comment-schema');
const HttpError = require("../models/http-error");
const { Storage } = require('@google-cloud/storage');

//-----------------------------------------------------------------------------------

const getAllDrops = async (req, res, next) => {
  let drops = [];
  try{
    drops = await Drop.find({});
  }catch(err){
    return next(new HttpError("Something went wrong, could not get all drops", 500));
  }
  res.json(drops);
}

//-----------------------------------------------------------------------------------

const getDropById = async (req, res, next) => {
  const dropId = req.params.dropId;
  let drop;

  try {
    drop = await Drop.findById(dropId)
      .populate({
        path: 'comments', 
        model: 'Comment', 
        populate: [{
          path: 'author', 
          model: 'User', 
          select: 'name handle profilePic'
        }, {
          path: 'subComments author',
          model: 'User',
          select: 'name handle profilePic',
        }
        ]
      })
      .exec();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Something went wrong, could not find drop", 500));
  }
  if (!drop) {
    return next(new HttpError("Could not find drop for the provided id", 404));
  }
  const preparedDrop = req.userData ? prepareDrop(drop, userData.userId) : prepareDrop(drop);
  res.json(preparedDrop);
};

//-----------------------------------------------------------------------------------

const getAllDropIds = async (req, res, next) => {
  let drops;
  try{
    drops = await Drop.find({});
  }catch(err){
    return next(new HttpError('Sonething went wrong. could not get all ids', 500));
  }
  const ids = drops.map(d => d._id);
  res.json(ids);
}


//-----------------------------------------------------------------------------------



const getDropsByIds = async (req, res, next) => {
  const { ids } = req.body;
  let drops;
  try{
    drops = await Drop.find({'_id': {$in: ids}}).populate('comments').exec();
  }catch(err){
    return next(new HttpError('One or more ids are not valid', 400));
  }
  if(!drops){
    return next(new HttpError('no drop found', 404));
  }
  const preparedDrops = drops.map(d => {
    return req.userData ? prepareDrop(d, userData.userId) : prepareDrop(d);
  });
  res.json(preparedDrops);
}


//-----------------------------------------------------------------------------------

const getCommentsForDrop = async (req, res, next) => {
  const dropId = req.params.dropId;
  let drop;
  try{
    drop = await Drop.findById(dropId);
  }catch(err){
    return next(new HttpError("Something went wrong while fetching the drop, please try again", 500));
  }
  if (!drop) {
    return next(new HttpError('Could not find drop for provided id', 404));
  }
  const ids = drop.comments;
  const comments = await Comment.find().where('_id').in(ids).exec();
  res.json({comments: comments.map(c => {return prepareComment(c)})})
}

//-----------------------------------------------------------------------------------


const createDrop = async (req, res, next) => {
  const { title, source } = req.body;
  const creatorId = req.userData.userId;
  if(!req.file){
    return next(new HttpError('No file received', 400));
  }
  let user;
  try{
    user = await User.findById(creatorId)//.session(sess);
  }catch(err){
    return next(new HttpError("Creating drop failed, please try again", 500));
  }
  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }
  console.log(req.file.originalname);
  const storage = new Storage({
    keyFilename: path.join(__dirname, '../drop-260521-cc0eb8f443d7.json'),
    projectId: 'drop-260521'
  });
  const memesBucket = storage.bucket('drop-meme-bucket')
  
  const createdDrop = new Drop({
    title,
    creatorId,
    meme: "f",
    source,
    posted: new Date(),
    leftSwipers: [],
    rightSwipers: [],
    pinners: [],
    comments: []
  });
  
  //////// Post Pic to GCP Bucket /////////////////////////////////////////////////////////////
  const gcsname = `meme-${createdDrop._id}`;
  const file = memesBucket.file(gcsname);
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
    req.file.cloudStorageObject = gcsname;
  });
  stream.end(req.file.buffer);
  //////////////////////////////////////////////////////////////////////
  
  try {
    await createdDrop.save();
  }catch(err){
    console.log(err);
    return next(new HttpError('Creating drop failed, please try again', 500));
  }
  user.createdDrops.push(createdDrop);
  try{
    await user.save();
  }catch(err){
    console.log(err);
    return next(new HttpError('Creating drop failed, please try again', 500));
  }
  res.status(201).json({ Drop: createdDrop });
};

//-----------------------------------------------------------------------------------

const updateDrop = async (req, res, next) => {
  const { title, meme, source } = req.body;
  const dropId = req.params.dropId;
  let drop;
  try {
    drop = await Drop.findById(dropId);
  } catch (err) {
    return next(new HttpError("Something went wrong, could not find drop", 500));
  }
  if (!drop) {
    return next(new HttpError("Could not find drop for the provided id", 404));
  }
  drop.title = title;
  drop.meme = meme;
  drop.source = source;
  try {
    await drop.save();
  } catch (err) {
    return next(new HttpError("Something went wrong, could not update drop", 500));
  }
  const preparedDrop = prepareDrop(drop);
  res.status(200).json({ drop: preparedDrop });
};

//-----------------------------------------------------------------------------------

const deleteDrop = async (req, res, next) => {
  const dropId = req.params.dropId;
  let drop;
  try {
    drop = await Drop.findById(dropId);
  } catch (err) {
    return next(new HttpError("Something went wrong, could not find drop", 500));
  }
  if (!drop) {
    return next(new HttpError("Could not find drop for the provided id", 404));
  }
  try {
    await Drop.findOneAndDelete(dropId);
  } catch (err) {
    return next(new HttpError("Something went wrong, could not delete drop", 500));
  }
  res.status(200).json({ message: "Deleted Drop." });
};

//-----------------------------------------------------------------------------------

const swipeDrop = async (req, res, next) => {
  const dropId = req.params.dropId;
  const { like, anonymousId } = req.body; 
  console.log(anonymousId);
  const userId = req.userData ? req.userData.userId : null;
  let drop, user;
  try{
    drop = await getDrop(dropId, next); 
  }catch(err){
    return next(new HttpError('Something went wrong. Please try again later', 500));
  }
  if(userId){
    console.log('LOGGED IN')
    try{
      user = await getUser(userId, next); 
    }catch(err){
      return next(new HttpError('Something went wrong. Please try again later', 500));
    }
  }
  if(!drop){
    return next(new HttpError('Drop not found for given Id', 404));
  }
  if(like){
    drop.rightSwipers.push(user ? `${user._id}_${Date.now()}` : `${anonymousId}_${Date.now()}`);
    if(user) user.swipedRightDrops.push(drop._id);
  }else{
    drop.leftSwipers.push(user ? `${user._id}_${Date.now()}` : `${anonymousId}_${Date.now()}`);
    if(user) user.swipedLefttDrops.push(drop._id);
  }
  try {
    await drop.save();
    if(user) await user.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Swiping drop failed, please try again", 500));
  }
  res.status(200).json({message: "swiped successfully."})
}

//-----------------------------------------------------------------------------------

const saveDrop = async (req, res, next) => {
  const dropId = req.params.dropId;
  const { userId } = req.body; 
  const drop = await getDrop(dropId, next); 
  const user = await getUser(userId, next);
  user.savedDrops.push(drop);
  drop.pinners.push(user);
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await drop.save({session: sess});
    await user.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Save drop failed, please try again", 500));
  }
  res.status(200).json({message: "Drop saved successfully."})
}

//-----------------------------------------------------------------------------------

const getUser = async (id, next) => {
  let user;
  try{
    user = await User.findById(id);
  }catch(err){
    return next(new HttpError("Creating drop failed, please try again", 500));
  }
  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }
  return user;
}

//-----------------------------------------------------------------------------------

const getDrop = async (id, next) => {
  let drop;
  try {
    drop = await Drop.findById(id);
  } catch (err) {
    return next(new HttpError("Something went wrong, could not find drop", 500));
  }
  if (!drop) {
    return next(new HttpError("Could not find drop for the provided id", 404));
  }
  return drop;
}


///////////////////////////////////////////////////////////////////////////////////////////////////

// const bucketName = "drop-meme-bucket";
// const filename = "/home/chris/drop/stream-server/DB/a0R3Vnd_460s.jpg";
// async function uploadFile() {
//   await storage.bucket(bucketName).upload(filename, {
//     gzip: true,
//     metadata: {
//       cacheControl: 'public, max-age=31536000',
//     },
//   });

//   console.log(`${filename} uploaded to ${bucketName}.`);
// }

// uploadFile().then(console.log).catch(console.error);

////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getAllDropIds = getAllDropIds;
exports.getAllDrops = getAllDrops; 
exports.getCommentsForDrop = getCommentsForDrop;
exports.saveDrop = saveDrop; 
exports.createDrop = createDrop;
exports.getDropById = getDropById;
exports.updateDrop = updateDrop;
exports.deleteDrop = deleteDrop;
exports.swipeDrop = swipeDrop;
exports.getDropsByIds = getDropsByIds;