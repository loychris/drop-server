const { validationResult } = require("express-validator");
const { prepareComment } = require("../util/util");
const Drop = require("../models/drop");
const User = require("../models/user");


const HttpError = require("../models/http-error");

const getDropById = async (req, res, next) => {
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
  res.json({ drop: drop.toObject({ getters: true }) });
};

const createDrop = async (req, res, next) => {
  const { title, creator, meme, source } = req.body;
  let user;
  try{
    user = await User.findOne({ handle: creator })
  }catch(err){
    console.log(err);
    return next(new HttpError("Creating drop failed, please try again", 500));
  }
  console.log(user);
  if (!user) {
    return next(new HttpError('Could not find user for provided handle', 404));
  }
  const createdDrop = new Drop({
    title,
    creator,
    meme,
    source,
    leftSwipers: [],
    rightSwipers: [],
    pinners: [],
    comments: []
  });
  try {
    await createdDrop.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Creating drop failed, please try again", 500));
  }
  res.status(201).json({ Drop: createdDrop });
};

const updateDrop = async (req, res, next) => {
  const { title, creator, memeId, source } = req.body;
  const dropId = req.params.dropId;
  let drop;
  try {
    drop = await Drop.findById(dropId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find drop", 500)
    );
  }
  drop.title = title;
  drop.creator = creator;
  drop.memeId = memeId;
  drop.source = source;
  try {
    await drop.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update drop", 500)
    );
  }
  res.status(200).json({ drop: drop.toObject({ getters: true }) });
};

const deleteDrop = async (req, res, next) => {
  const dropId = req.params.dropId;
  console.log(dropId);
  let drop;
  try {
    drop = await Drop.findById(dropId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find drop", 500)
    );
  }
  console.log(drop);
  try {
    await drop.remove();
  } catch (err) {
    console.log(err);

    return next(
      new HttpError("Something went wrong, could not delete drop", 500)
    );
  }
  res.status(200).json({ message: "Deleted Drop." });
};

const swipeDrop = async (req, res, next) => {

}

exports.createDrop = createDrop;
exports.getDropById = getDropById;
exports.updateDrop = updateDrop;
exports.deleteDrop = deleteDrop;
exports.swipeDrop = swipeDrop;
