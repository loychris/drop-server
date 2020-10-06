const { validationResult } = require("express-validator");
const mongoose = require('mongoose');

const { prepareDrop, prepareComment, prepareSubComment } = require("../util/util");
const Drop = require("../models/drop");
const User = require("../models/user");
const Comment = require('../models/comment');
const HttpError = require("../models/http-error");

const joinWaitingList = async (req, res, next) => {
    const email = req.body.email;
    if(!email){
      return next(new HttpError("NO email attached", 400));
    }
    console.log(email);
    res.json({message: `Added ${email} to waiting list.`})
}



exports.joinWaitingList = joinWaitingList;
