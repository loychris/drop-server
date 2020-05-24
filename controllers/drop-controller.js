const { validationResult } = require("express-validator");
const mongoose = require('mongoose');

const { prepareDrop, prepareComment } = require("../util/util");
const Drop = require("../models/drop");
const User = require("../models/user");
const HttpError = require("../models/http-error");


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

const createDrop = async (req, res, next) => {
  const { title, creatorId, meme, source } = req.body;
  let user;
  try{
    user = await User.findById(creatorId);
  }catch(err){
    return next(new HttpError("Creating drop failed, please try again", 500));
  }
  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }
  const createdDrop = new Drop({
    title,
    creatorId,
    meme,
    source,
    posted: new Date(),
    leftSwipers: [],
    rightSwipers: [],
    pinners: [],
    comments: []
  });
  console.log(createdDrop); 
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdDrop.save({session: sess});
    user.createdDrops.push(createdDrop);
    await user.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Creating drop failed, please try again", 500));
  }
  res.status(201).json({ Drop: createdDrop });
};

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

const getDrop = async (id, next) => {
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


exports.saveDrop = saveDrop; 
exports.createDrop = createDrop;
exports.getDropById = getDropById;
exports.updateDrop = updateDrop;
exports.deleteDrop = deleteDrop;
exports.swipeDrop = swipeDrop;
