const { validationResult } = require("express-validator");
const mongoose = require('mongoose');

const { prepareDrop, prepareComment } = require("../util/util");
const Drop = require("../models/drop");
const User = require("../models/user");
const Comment = require("../models/comment");
const HttpError = require("../models/http-error");

const createComment = async (req, res, next) => {
    const { authorId, comment } = req.body;
    let author;
    try{
      author = await User.findById(authorId);
    }catch(err){
      return next(new HttpError("Creating Comment failed, please try again", 500));
    }
    if (!author) {
      return next(new HttpError('Could not find user for provided id', 404));
    }
    let drop = getDropFromDB(dropId);
    const createdComment = new Comment({
        comment,
        drop,
        author,
        posted: new Date(),
        upVoters: [],
        downVoters: [],
        subComments: []
    })
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
    res.status(201).json({ Comment: createdComment })
}


const getComments = async (req, res, next) => {
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
    const comment = await getCommnetFromDB(commentId);
    const preparedComment = prepareComment(comment);
    res.json(preparedComment);
}
const deleteComment = async (req, res, next) => {}
const updateComment = async (req, res, next) => {}
const voteComment = async (req, res, next) => {}
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
exports.getComments = getComments;
exports.getComment = getComment;
exports.deleteComment = deleteComment;
exports.updateComment = updateComment;
exports.voteComment = voteComment;
exports.createSubComment = createSubComment;
exports.deleteSubComment = deleteSubComment;
exports.voteSubComment = voteSubComment;
