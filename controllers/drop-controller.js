const { validationResult } = require("express-validator");
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const { prepareDrop, prepareComment } = require("../util/util");
const Drop = require("../models/drop");
const User = require("../models/user");
const HttpError = require("../models/http-error");

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
    drop = await Drop.findById(dropId);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Something went wrong, could not find drop", 500));
  }
  if (!drop) {
    return next(new HttpError("Could not find drop for the provided id", 404));
  }
  const preparedDrop = prepareDrop(drop)
  res.json({ drop: preparedDrop});
};

//-----------------------------------------------------------------------------------

const getCommentsForDrop = async (req, res, next) => {
  const dropId = req.params.dropId;
  const drop = await getDropFromDB(dropId, next);
  const ids = drop.comments;
  const comments = await Comment.find().where('_id').in(ids).exec();
  res.json({comments: comments.map(c => {return prepareComment(c)})})
}

//-----------------------------------------------------------------------------------

const createDrop = async (req, res, next) => {
  const { title, creatorId, source } = req.body;
  if(!req.file){
    return next(new HttpError('No file received', 400));
  }

  // handle file saving
  const file = req.file; 
  const filePath = path.join(__dirname.split('/').slice(0, -1).join('/'), 'DB', file.originalname);
  fs.writeFileSync(filePath, file);

  // update user
  let user;
  try{
    user = await User.findById(creatorId);
  }catch(err){
    return next(new HttpError("Creating drop failed, please try again", 500));
  }
  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }
  console.log(file.originalname);

  const createdDrop = new Drop({
    ...req.body, 
    meme: file.originalname,
    posted: new Date(),
    leftSwipers: [],
    rightSwipers: [],
    pinners: [],
    comments: []
  });
  console.log(createdDrop); 
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
  res.status(201).json(createdDrop);
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
    await drop.remove();
  } catch (err) {
    return next(new HttpError("Something went wrong, could not delete drop", 500));
  }
  res.status(200).json({ message: "Deleted Drop." });
};

//-----------------------------------------------------------------------------------

const swipeDrop = async (req, res, next) => {
  const dropId = req.params.dropId;
  const { userId, like } = req.body; 
  const drop = await getDrop(dropId, next); 
  const user = await getUser(userId, next);
  if(like){
    drop.leftSwipers.push(user);
    user.swipedLeftDrops.push(drop);
  }else{
    drop.rightSwipers.push(user);
    user.swipedRightDrops.push(drop);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await drop.save({session: sess});
    await user.save({session: sess});
    await sess.commitTransaction();
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

exports.getAllDropIds = getAllDropIds;
exports.getAllDrops = getAllDrops; 
exports.getCommentsForDrop = getCommentsForDrop;
exports.saveDrop = saveDrop; 
exports.createDrop = createDrop;
exports.getDropById = getDropById;
exports.updateDrop = updateDrop;
exports.deleteDrop = deleteDrop;
exports.swipeDrop = swipeDrop;
