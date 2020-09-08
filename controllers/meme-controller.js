const path = require("path");
const fs = require("fs");

const Drop = require('../models/drop');
const HttpError = require("../models/http-error");


const getMemeByDropId = async (req, res, next) => {
  const dropId = req.params.dropId;
  let drop 
  try {
    drop = await Drop.findById(dropId);
  }catch(err){
    return next(new HttpError('Something went wrong. Please try again', 500));
  }
  if(!drop){
    return next(new HttpError('No meme found for given Id', 404));
  }
  const filePath = path.join(__dirname.split('/').slice(0, -1).join('/'), 'DB', drop.meme);
  res.sendFile(filePath);
}

exports.getMemeByDropId = getMemeByDropId;
