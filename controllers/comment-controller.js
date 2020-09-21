const { validationResult } = require("express-validator");
const mongoose = require('mongoose');

const { prepareDrop, prepareComment, prepareSubComment } = require("../util/util");
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
        author: authorId,
        posted: new Date(),
        upVoters: [],
        downVoters: [],
        subComments: [],
        nextSubId: 0
    });
    try {
        await createdComment.save(),
        author.writtenComments.push(createdComment);
        await author.save();
        drop.comments.push(createdComment);
        await drop.save();
    } catch(err){
        console.log(err);
        return next(new HttpError("Creating comment failed, please try again", 500))
    }
    const preparedComment = prepareComment(createdComment);
    res.status(201).json(preparedComment);
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

const deleteComment = async (req, res, next) => {
  const commentId = req.params.commentId
  let comment;
  try {
    comment = await getCommnetFromDB(commentId, next);
  }catch(err){
    return next(new HttpError('There was a problem finding the commen'))
  }
  try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    author.writtenComments.pull(commentId);
    author.save({session: sess});
    drop.comments.pull(commentId);
    drop.save({session: sess});
    await sess.commitTransaction();
  }catch(err){
    return next(new HttpError("Could not delete Comment. Try again later", 500));
  }
  res.status(200).json({message: "Deleted Comment."});
}




const voteComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const { voterId, vote } = req.body;
  let comment = await getCommnetFromDB(commentId, next);
  let voter = await getUserFromDB(voterId, next);
  try{
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
    await sess.commitTransaction();
  }catch(err){
    console.log(err);
    return next(new HttpError("Something went wrong. Couldn't vote comment")); 
  }
  const preparedComment = prepareComment(comment);
  res.status(200).json(preparedComment);
}

const createSubComment = async (req, res, next) => {
  const { authorId, actualComment, parentPath } = req.body;
  const commentId = req.params.commentId;
  const author = await getUserFromDB(authorId, next);
  const comment = await getCommnetFromDB(commentId, next);
  let nextSubId;
  if(parentPath === commentId) {
    nextSubId = comment.nextSubId
    const nextSubCommentId = `${Number(nextSubId) + 1}`;  
    comment.nextSubId = nextSubCommentId;
  }else{
    const parent = comment.subComments.find(s => s.path === parentPath)
    if(!parent){
      return next(new HttpError("Invalid parent path. There is np subComment with that path!"))
    }
    nextSubId = parent.nextSubId;
    const nextSubCommentId = `${Number(nextSubId) + 1}`;  
    parent.nextSubId = nextSubCommentId;
  }
  const path = `${parentPath}/${nextSubId}`; 
  const subComment = {
    actualComment,
    authorId,
    path,
    posted: new Date(),
    upVoters: [],
    downVoters: [],
    nextSubId: 0
  }
  try{
    comment.subComments.push(subComment);
    comment.save();
  }catch(err){
    return next(new HttpError("Something went wrong. Please try again later.", 500))
  }
  const subcomment = prepareSubComment(subComment);
  res.status(201).json(subcomment);
}


const deleteSubComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const { path } = req.body;
  const comment = await getCommnetFromDB(commentId, next);
  if(!comment.subComments.some(s => s.path === path)){
    return next(new HttpError('Invalid path. There is no SubComment with that path.')); 
  }
  const subCommentsNew = comment.subComments.filter(c => !c.path.startsWith(path));
  try{
    comment.subComments = subCommentsNew;
    comment.save()
  }catch(err){
    return next(new HttpError("Something went wrong while deleting SubComment. Please try again later", 500));
  }
  res.status(200).json(comment.subComments.map(c => c.path).sort());
}


const voteSubComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const { path, voterId, vote } = req.body;
  const comment = await getCommnetFromDB(commentId, next);
  const voter = await getUserFromDB(voterId, next);
  const subComment = comment.subComments.find(s => s.path === path);
  if(!subComment){
    return next(new HttpError('Invalid path. There is no SubComment with that path.'));
  }
  const subComments = comment.subComments.filter(s => s.path !== path);

  const sess = await mongoose.startSession();
  sess.startTransaction();

  subComment.upVoters.pull(voterId);
  subComment.downVoters.pull(voterId);

  if(vote === "up"){
    subComment.upVoters.push(voterId);
    voter.upVotedSubComments.push({ comment, path });
  }else if(vote === "down"){
    subComment.downVoters.push(voterId);
    voter.downVotedSubComments.push({ comment, path });
  }

  subComments.push(subComment);
  comment.subComments = subComments;
  
  comment.save({session: sess})
  voter.save({session: sess})
  await sess.commitTransaction();
  res.json(subComment);
}


const getDropFromDB = async (dropId, next) => {     
    let drop;
    try{
        drop = await Drop.findById(dropId)
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

const getAllComments = async (req, res, next) => {
  let comments;
  try{
    comments = await Comment.find({});
  }catch(err){
    return next(new HttpError('Something went wrong while fetching the comments', 500));
  }
  res.json(comments);
}


exports.getAllComments = getAllComments;
exports.createComment = createComment;
exports.getComment = getComment;
// exports.deleteComment = deleteComment;
exports.updateComment = updateComment;
exports.voteComment = voteComment;
exports.createSubComment = createSubComment;
exports.deleteSubComment = deleteSubComment;
exports.voteSubComment = voteSubComment;
