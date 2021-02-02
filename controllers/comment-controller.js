const { validationResult } = require("express-validator");
const mongoose = require('mongoose');

const { prepareDrop, prepareComment, prepareSubComment } = require("../util/util");
const Drop = require("../models/drop-schema");
const { User } = require('../models/user-schema');
const Comment = require('../models/comment-schema');
const HttpError = require("../models/http-error");

const createComment = async (req, res, next) => {
  const userId = req.userData.userId;
  const { comment } = req.body;
  const { dropId } = req.params; 
  let user;
  try{
    user = await User.findById(userId)
  }catch(err){ console.log(err); return next(new HttpError('Something went wrong. Try again later.', 500))}
  if(!user){    return next(new HttpError('User not found', 404))}  
  let drop; 
  try{
    drop = await Drop.findById(dropId);
  }catch(err){ console.log('1'); return next(new HttpError('Something went wrong. Try again later.', 500))}
  if(!drop){    return next(new HttpError('Drop not found', 404))}  
  const createdComment = new Comment({
      comment,
      drop: dropId,
      author: userId,
      posted: new Date(),
      upVoters: [],
      downVoters: [],
      subComments: [],
      nextSubId: 0
  });
  user.writtenComments.push(createdComment._id);
  drop.comments.push(createdComment._id);
  try {
    await createdComment.save(),
    await user.save();
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
  const userId = req.userData.userId;
  const commentId = req.params.commentId;
  const comment = await getCommnetFromDB(commentId);
  if(comment.author !== userId) return next(new HttpError('Only the author of the comment can delete it!', 401))
  comment.deleted = true;
  try{
    await comment.save()
  }catch(err){
    return next(new HttpError("Could not delete Comment. Try again later", 500));
  }
  res.status(200).json({message: "Deleted Comment."});
}




const voteComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const { vote } = req.body;
  const voterId = req.userData.userId;
  if(vote === 'up'){
    await Comment.updateOne(
      {_id: commentId },
      { $addToSet: { upVoters : voterId }, $pull: { downVoters: voterId }}
    ).exec((err, info) => {    
      if(err){
        console.log(err);
        return next(new HttpError("Something went wrong while voting.", 500))
      }
    })
    User.updateOne(
      {_id: voterId },
      { $addToSet: { upVotedComments : commentId }, $pull: { downVotedComments: commentId }}
    ).exec((err, info) => {
      if(err){
        console.log(err);
        return next(new HttpError("Something went wrong while voting.", 500))
      }
    })
  }else if(vote === 'down'){
    await Comment.updateOne(
      {_id: commentId },
      { $addToSet: { downVoters : voterId }, $pull: { upVoters: voterId }}
    ).exec((err, info) => {
      if(err){
        console.log(err);
        return next(new HttpError("Something went wrong while voting.", 500))
      }
    })
    await User.updateOne(
      {_id: voterId },
      { $addToSet: { downVotedComments : commentId }, $pull: { upVotedComments: commentId }}
    ).exec((err, info) => {
      if(err){
        console.log(err);
        return next(new HttpError("Something went wrong while voting.", 500))
      }
    })
  }else if(vote === 'neutral'){
    await Comment.updateOne(
      {_id: commentId },
      { $pull: { downVoters : voterId }, $pull: { upVoters: voterId }}
    ).exec((err, info) => {
      if(err){
        console.log(err);
        return next(new HttpError("Something went wrong while voting.", 500))
      }
    })    
    await User.updateOne(
      {_id: voterId },
      { $pull: { downVotedComments : commentId }, $pull: { upVotedComments: commentId }}
    ).exec((err, info) => {
      if(err){
        console.log(err);
        return next(new HttpError("Something went wrong while voting.", 500))
      }
    })
    res.status(200).json("I voted!");
  }
}

const createSubComment = async (req, res, next) => {
  const authorId = req.userData.userId;
  const { actualComment, parentPath } = req.body;
  console.log(parentPath);
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
    author.writtenSubComments.push({comment: commentId, path})
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
  const voterId = req.userData.userId;
  const commentId = req.params.commentId
  const { path, vote } = req.body;
  const comment = await getCommnetFromDB(commentId, next);
  const voter = await getUserFromDB(voterId, next);
  const subComment = comment.subComments.find(s => s.path === path);
  if(!subComment){
    return next(new HttpError('Invalid path. There is no SubComment with that path.'));
  }
  const subComments = comment.subComments.filter(s => s.path !== path);
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
  comment.save()
  voter.save()
  res.json(subComment);
}

const reportComment = async (req, res, next) => {
  const reporterId = req.userData.userId;
  const { commentId, path } = req.body;
  let reporter = await getUserFromDB(reporterId);
  let comment = await getCommentFromDB(commentId);
  comment.reported = true;
  try{
    await comment.save()
  }catch(err){
    console.log(err)
    return next(new HttpError('Something went wrong while reporting the comment. Please try again later', 500))
  }
  res.status(200).json({message: "comment reported!"});
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
exports.deleteComment = deleteComment;
exports.updateComment = updateComment;
exports.voteComment = voteComment;
exports.createSubComment = createSubComment;
exports.deleteSubComment = deleteSubComment;
exports.voteSubComment = voteSubComment;
