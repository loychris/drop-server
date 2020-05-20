const { validationResult } = require("express-validator");
const mongoose = require('mongoose');

const { prepareDrop, prepareComment } = require("../util/util");
const Drop = require("../models/drop");
const User = require("../models/user");
const Comment = require('../models/comment');
const HttpError = require("../models/http-error");

const createComment = async (req, res, next) => {
    const { authorId, comment } = req.body;
    const dropId = req.params.dropId; 
    const author = await getUserFromDB(authorId, next);
    const drop = await getDropFromDB(dropId, next);
    const createdComment = new Comment({
        comment,
        drop,
        author,
        posted: new Date(),
        upVoters: [],
        downVoters: [],
        subComments: []
    });
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdComment.save({session: sess}),
        author.writtenComments.push(createdComment);
        await author.save({session: sess});
        drop.comments.push(createdComment);
        await drop.save({session: sess});
        await sess.commitTransaction();
    } catch(err){
        console.log(err);
        return next(new HttpError("Creating comment failed, please try again", 500))
    }
    const preparedComment = prepareComment(createdComment);
    res.status(201).json(preparedComment);
}

const getCommentsForDrop = async (req, res, next) => {
    const dropId = req.params.dropId;
    const drop = await getDropFromDB(dropId);
    const ids = drop.comments;
    console.log(ids);
    const comments = await Comment.find().where('_id').in(ids).exec();
    console.log(comments);
    res.json({comments: comments.map(c => {return prepareComment(c)})})
}

const getComment = async (req, res, next) => {
    const commentId = req.params.commentId;
    const comment = await getCommnetFromDB(commentId, next);
    const preparedComment = prepareComment(comment);
    res.json(preparedComment);
}

const updateComment = async (req, res, next) => {
    const { newComment } = req.body;
    console.log("new: ", newComment);
    const commentId = req.params.commentId;
    let comment = await getCommnetFromDB(commentId, next);
    comment.comment = newComment;
    try{
      await comment.save()
    }catch(err){
      return next(new HttpError("Something went wrong. could not update comment", 500)); 
    }
    const preparedComment = prepareComment(comment);
    res.json(preparedComment);
}


const voteComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const { voterId, vote } = req.body;
  let comment = await getCommnetFromDB(commentId, next);
  let voter = await getUserFromDB(voterId, next);
  const sess = await mongoose.startSession();
  sess.startTransaction();
  comment.upVoters.pull(voterId);
  comment.downVoters.pull(voterId);
  voter.upVotedComments.pull(commentId);
  voter.downVotedComments.pull(commentId);
  if(vote === "up"){
    comment.upVoters.push({_id: voterId});
    await comment.save({session: sess});
    voter.upVotedComments.push(comment);
    await voter.save({session: sess});
  } else if(vote === "down"){
    comment.downVoters.push(voterId);
    await comment.save({session: sess});
    voter.downVotedComments.push(comment);
    await voter.save({session: sess});
  } else {
    return next(new HttpError("Invalid argument for vote", 500));
  }
  console.log(voter);
  await sess.commitTransaction();
  const preparedComment = prepareComment(comment);
  res.status(200).json(preparedComment);
}


const createSubComment = async (req, res, next) => {}
const deleteSubComment = async (req, res, next) => {}
const voteSubComment = async (req, res, next) => {}


const getDropFromDB = async (dropId, next) => {     
    let drop;
    try{
        drop = await Drop.findById(dropId);
      }catch(err){
        return next(new HttpError("Something went wrong while fetching the drop, please try again", 500));
      }
      if (!drop) {
        return next(new HttpError('Could not find drop for provided id', 404));
      }
      return drop;
}

const getCommnetFromDB = async (commentId, next) => {
    let comment;
    try{
      comment = await Comment.findById(commentId);
    }catch(err){
      return next(new HttpError("Something went wrong while fetching the comment, please try again", 500));
    }
    if (!comment) {
      return next(new HttpError('Could not find comment for provided id', 404));
    }
    return comment;
}

const getUserFromDB = async (userId, next) => {
    let user;
    try{
        user = await User.findById(userId);
    }catch(err){
        return next(new HttpError("Something went wrong while fetching the user, please try again", 500));
      }
      if (!user) {
        return next(new HttpError('Could not find user for provided id', 404));
      }
      return user;
}

exports.createComment = createComment;
exports.getCommentsForDrop = getCommentsForDrop;
exports.getComment = getComment;
// exports.deleteComment = deleteComment;
exports.updateComment = updateComment;
exports.voteComment = voteComment;
exports.createSubComment = createSubComment;
exports.deleteSubComment = deleteSubComment;
exports.voteSubComment = voteSubComment;
