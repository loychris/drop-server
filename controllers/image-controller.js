const { validationResult } = require("express-validator");
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const { prepareImage } = require("../util/util");
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
    creator: creatorId,
    created: timestamp,
    updated: timestamp,
    public: public ? public : false,
    access: [user._id]
  });
  

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
      const preparedImage = prepareImage(createdImage);
      res.status(201).json({ Image: preparedImage });
    } catch (err) {
      console.error(err);
      return next(new HttpError('Creating Image failed, please try again', 500));
    }
  });

  stream.end(req.file.buffer);
};

//-----------------------------------------------------------------------------------


const getImageById = async (req, res, next) => {
  const imageId = req.params.imageId;
  let image;
  const userData = req.userData; 
  try {
    image = await Image.findById(imageId);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Something went wrong, could not find image", 500));
  }
  if (!image) {
    return next(new HttpError("Could not find image for the provided id", 404));
  }
  if(!image.public){
    if(!userData || !image.access.includes(userData.userId)){
      return next(new HttpError("Not authorised to access image", 401));
    }
  }
  const preparedImage = prepareImage(image)
  res.json(preparedImage);
};

//-----------------------------------------------------------------------------------

const updateImage = async (req, res, next) => {
  const { name, public } = req.body;
  console.log("NAME", name);
  console.log("PUBLIC", public);

  const imageId = req.params.imageId;

  let image;
  try {
    image = await Image.findById(imageId).populate('creator', "admin");
  } catch (err) {
    return next(new HttpError("Something went wrong, could not find image", 500));
  }
  if (!image) {
    return next(new HttpError("Could not find image for the provided id", 404));
  }
  if(image.creator._id.toString() !== req.userData.userId && !image.creator.admin){
    return next(new HttpError("Not authorised to update image", 401));
  }

  console.log(image);

  const timestamp = Date.now();
  image.name = name ? name : image.name;
  image.public = public ? public : image.public;
  image.updated = timestamp;


  console.log(image);



  if(req.file){
    const filename = req.file.originalname; 
    const storage = new Storage({
      keyFilename: path.join(__dirname, '../drop-260521-090d01353418.json'),
      projectId: 'drop-260521'
    });
    const imageBucket = storage.bucket('drop-image-bucket')    
    const gcsname = `image-${imageId}`;
    const file = imageBucket.file(gcsname);

    // Delete existing image from GCP bucket
    try {
      await imageBucket.file(gcsname).delete();
    } catch (err) {
      console.error(err);
      return next(new HttpError('Failed to delete existing image from bucket', 500));
    }

    // Upload new image to GCP bucket
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      },
      resumable: false
    });
    stream.on('error', (err) => {
      req.file.cloudStorageError = err;
      console.log(err);
      return next(new HttpError('Failed to upload image to bucket', 500));
    });
    stream.on('finish', async () => {
      req.file.cloudStorageObject = gcsname;
      try {
        image.filename = filename;
        await image.save();
        const preparedImage = prepareImage(image);
        res.status(200).json({ Image: preparedImage });
      } catch (err) {
        console.error(err);
        return next(new HttpError('Creating Image failed, please try again', 500));
      }
    });
    stream.end(req.file.buffer);
  } else {
    try {
      await image.save();
    } catch (err) {
      return next(new HttpError("Something went wrong, could not update Image", 500));
    }
    const preparedImage = prepareImage(image);
    res.status(200).json({ image: preparedImage });
  }
};

//-----------------------------------------------------------------------------------

const deleteImage = async (req, res, next) => {
  const imageId = req.params.imageId;
  const userId = req.userData.userId;

  let image;
  try {
    image = await Image.findById(imageId);
  } catch (err) {
    return next(new HttpError("Something went wrong, could not find image", 500));
  }
  if (!image) {
    return next(new HttpError("Could not find image for the provided id", 404));
  }

  let user;
  try{
    user = await User.findById(userId);
  }
  catch(err){
    return next(new HttpError("Something went wrong, could not find user", 500));
  }
  if(!user){
    return next(new HttpError("Could not find user for the provided id", 404));
  }

  if(image.creator.toString() !== userId && !user.admin){
    return next(new HttpError("Not authorised to delete image", 401));
  }

  const storage = new Storage({
    keyFilename: path.join(__dirname, '../drop-260521-090d01353418.json'),
    projectId: 'drop-260521'
  });
  const imageBucket = storage.bucket('drop-image-bucket');
  const gcsname = `image-${image._id}`;

  // Delete image from GCP bucket
  try {
    await imageBucket.file(gcsname).delete();
  } catch (err) {
    console.error(err);
    return next(new HttpError('Failed to delete image from bucket', 500));
  }

  try {
    await Image.findOneAndDelete(imageId);
  } catch (err) {
    return next(new HttpError("Something went wrong, could not delete image", 500));
  }
  res.status(200).json({ message: "Deleted Image." });
};


//-----------------------------------------------------------------------------------




module.exports = {
  getImageById,
  createImage,
  updateImage,
  deleteImage,
}