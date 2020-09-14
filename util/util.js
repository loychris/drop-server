const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');

const prepareComment = (c) => {
  const {
    comment,
    author,
    posted,
    upVoters,
    downVoters,
    subComments,
    _id
  } = c;
  
  return {
    id: _id,
    comment,
    authorId: author,
    posted,
    score: upVoters.length-downVoters.length,
    subComments: subComments ? subComments.map(s => prepareSubComment(s)) : []
  }
};

const prepareSubComment = (subComment) => {
  const {
    upVoters,
    downVoters,
    _id,
    actualComment,
    author,
    path,
    posted,
    subComments
  } = subComment;

  return {
    id: _id,
    author,
    path,
    points: upVoters.length-downVoters.length,
    comment: actualComment,
    subComments: subComments ? subComments.map(s => prepareSubComment(s)) : []
  }
}


const prepareDrop = (drop) => {
  return {
    title: drop.title,
    creatorId: drop.creatorId,
    memeUrl: drop.url,
    source: drop.source,
    //pinned: drop.pinners.length,
    comments: drop.comments,
  }
}

const checkValidation = (req, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }
}

exports.prepareDrop = prepareDrop;
exports.checkValidation = checkValidation;
exports.prepareComment = prepareComment;


