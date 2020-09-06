const path = require("path");
const fs = require("fs");

const Drop = require('../models/drop');
const HttpError = require("../models/http-error");


const getMemeByDropId = async (req, res, next) => {
  const dropId = req.params.dropId;
  let drop;
  try {
    drop = await Drop.findById(dropId);
  }catch(err){
    return next(new HttpError('Something went wrong. Please try again later', 500));
  }
  if(!drop){
    return next(new HttpError('Drop not found for id', 404))
  }
  const memePath = path.join(__dirname.split('/').slice(0, -1).join('/'),"DB", drop.meme)
  res.sendFile(memePath);
};

exports.getMemeByDropId = getMemeByDropId;