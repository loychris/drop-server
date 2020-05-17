const { validationResult } = require("express-validator");
const { prepareComment, checkUser } = require("../util/util");
const Drop = require("../models/drop");
const User = require("../models/user");


const HttpError = require("../models/http-error");

const getDropById = async (req, res, next) => {
  const dropId = req.params.dropId;
  console.log(dropId);
  let drop;
  try {
    drop = await Drop.findById(dropId);
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Something went wrong, could not find drop", 500)
    );
  }
  if (!drop) {
    return next(new HttpError("Could not find drop for the provided id", 404));
  }
  res.json({ drop: drop.toObject({ getters: true }) });
};

const createDrop = async (req, res, next) => {
  const { title, creator, meme, source } = req.body;
  let user = checkUser(creator);
  const createdDrop = new Drop({
    title,
    creator,
    meme,
    source,
    comments: [],
  });
  console.log(createdDrop);
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

exports.createDrop = createDrop;
exports.getDropById = getDropById;
exports.updateDrop = updateDrop;
exports.deleteDrop = deleteDrop;
