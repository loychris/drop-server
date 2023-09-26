const { validationResult } = require("express-validator");
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const { prepareMeme } = require("../util/util");
const Image = require("../models/image-schema");
const { User } = require('../models/user-schema');
const { Meme } = require("../models/meme-schema");
const HttpError = require("../models/http-error");
const { Storage } = require('@google-cloud/storage');


const createMeme = async (req, res, next) => {
  const { 
    title, 
    elements, 
    tags, 
    template
  } = req.body;
  const creatorId = req.userData.userId;

  console.log(elements)

  // fetch owner
  let user;
  try{
    user = await User.findById(creatorId)//.session(sess);
  }catch(err){
    return next(new HttpError("Creating image failed, please try again", 500));
  }
  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }

  // check if all images are uploaded 
  const imageIds = elements.filter(element => element.type === 'image').map(element => element.imageId);
  await Image.find({ _id: { $in: imageIds } }, (err, foundImages) => {
    if(err){
        return next(new HttpError("Creating meme failed, please try again", 500));
    }
    if(foundImages.length !== imageIds.length){
        return next(new HttpError("Creating meme failed. One or more images do not exist.", 404));
    }
  });

  const timestamp = Date.now();
  
  const createdMeme = new Meme({
    title,
    creator: creatorId,
    created_at: timestamp,
    updated_at: timestamp,
    elements,
    tags,
    originalTemplate: template || null,
  });
  
    try {
        await createdMeme.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError("Creating meme failed, please try again", 500));
    }
    const preparedMeme = prepareMeme(createdMeme);
    res.status(201).json({ meme: preparedMeme });
};

//-----------------------------------------------------------------------------------

const getMemeById = async (req, res, next) => {
    const memeId = req.params.memeId;
    let meme;
    try {
        meme = await Meme.findOne({ _id: memeId, deleted: { $exists: false }});
    } catch (err) {
        return next(new HttpError("Something went wrong, could not find meme", 500));
    }
    if (!meme) {
        return next(new HttpError("Could not find meme for the provided id", 404));
    }
    const preparedMeme = prepareMeme(meme);
    res.json({ meme: preparedMeme });
};

//-----------------------------------------------------------------------------------

const updateMeme = async (req, res, next) => {
    const { 
        title, 
        elements, 
        tags      
    } = req.body;
    const memeId = req.params.memeId;
    const creatorId = req.userData.userId;

    // fetch owner
    let user;
    try{
        user = await User.findById(creatorId)//.session(sess);
    }catch(err){
        return next(new HttpError("Creating image failed, please try again", 500));
    }
    if (!user) {
        return next(new HttpError('Could not find user for provided id', 404));
    }

      // fetch meme
    let meme;
    try {
        meme = await Meme.findOne({ _id: memeId, deleted: { $exists: false }});
    } catch (err) {
        return next(new HttpError("Something went wrong, could not find meme", 500));
    }
    if (!meme) {
        return next(new HttpError("Could not find meme for the provided id", 404));
    }
    
    // check if all images are uploaded 
    const imageIds = elements.filter(element => element.type === 'image').map(element => element.imageId);
    await Image.find({ _id: { $in: imageIds } }, (err, foundImages) => {
        if(err){
            return next(new HttpError("Creating meme failed, please try again", 500));
        }
        if(foundImages.length !== imageIds.length){
            return next(new HttpError("Creating meme failed. One or more images do not exist.", 404));
        }
    });
    

    // update meme
    const timestamp = Date.now();
      
    if(title) meme.title = title;
    if(elements) meme.elements = elements;
    if(tags) meme.tags = tags;
    meme.updated_at = timestamp;
      
    // save meme & resond
    try {
        await meme.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError("Creating meme failed, please try again", 500));
    }
    const preparedMeme = prepareMeme(meme);
    res.status(201).json({ meme: preparedMeme });
};

//-----------------------------------------------------------------------------------

const deleteMeme = async (req, res, next) => {
    const memeId = req.params.memeId;
    const creatorId = req.userData.userId;

    // fetch meme
    let meme;
    try {
        meme = await Meme.findOne({ _id: memeId, deleted: { $exists: false }}).populate('creator');
        } catch (err) {
        return next(new HttpError("Something went wrong, could not delete meme", 500));
    }
    if (!meme) {
        return next(new HttpError("Could not find meme for the provided id", 404));
    }

    // check if user is allowed to delete meme
    if(meme.creator._id.toString() !== creatorId && !meme.creator.admin){
        return next(new HttpError("Not authorised to delete meme", 401));
    }

    // set deleted flag
    const timestamp = Date.now();
    meme.deleted = timestamp;
    try {
        await meme.save();
    } catch (err) {
        return next(new HttpError("Something went wrong, could not delete meme", 500));
    }
    res.status(200).json({ message: "Deleted meme" });
};

//-----------------------------------------------------------------------------------


module.exports = {
  getMemeById,
  createMeme,
  updateMeme,
  deleteMeme,
}