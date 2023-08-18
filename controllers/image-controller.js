const { validationResult } = require("express-validator");
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const Image = require("../models/image-schema");
const { User } = require('../models/user-schema');
const HttpError = require("../models/http-error");
const { Storage } = require('@google-cloud/storage');

const createImage = async (req, res, next) => {
  const { name, public } = req.body;
  const creatorId = req.userData.userId;
  if(!req.file){
    return next(new HttpError('No file received', 400));
  }
  let user;
  try{
    user = await User.findById(creatorId)//.session(sess);
  }catch(err){
    return next(new HttpError("Creating image failed, please try again", 500));
  }
  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }

  const filename = req.file.originalname; 

  console.log(req.file);

  console.log(filename); 

  const storage = new Storage({
    keyFilename: path.join(__dirname, '../drop-260521-090d01353418.json'),
    projectId: 'drop-260521'
  });
  const imageBucket = storage.bucket('drop-image-bucket')

  const timestamp = Date.now();
  
  const createdImage = new Image({
    name: name ? name : req.file.originalname,
    filename, 
    creatorId,
    created: timestamp,
    updated: timestamp,
    public: public ? public : false,
    access: [user._id]
  });
  
  //////// Post Pic to GCP Bucket /////////////////////////////////////////////////////////////
  const gcsname = `image-${createdImage._id}`;
  const file = imageBucket.file(gcsname);
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
  stream.on('finish', async () => {
    req.file.cloudStorageObject = gcsname;
    console.log(`Finished uploading image ${createdImage._id} to gcp bucket`)

    // save image & updated user
    try {
      await createdImage.save();
      user.images.push(createdImage);
      await user.save();

      // send response
      res.status(201).json({ Image: createdImage });
    } catch (err) {
      console.error(err);
      return next(new HttpError('Creating Image failed, please try again', 500));
    }
  });

  stream.end(req.file.buffer);
  res.status(201).json({ Image: createdImage });
};

//-----------------------------------------------------------------------------------


const getImageById = async (req, res, next) => {
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

const updateImage = async (req, res, next) => {
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

const deleteImage = async (req, res, next) => {
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

module.exports = {
  getImageById,
  createImage,
  updateImage,
  deleteImage,
}