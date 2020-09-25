const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');

const prepareComment = (c, userId) => {
  const { comment, author, posted, upVoters, downVoters, subComments, _id } = c;
  let preparedComment = {
    id: _id,
    comment,
    authorId: author,
    posted,
    points: upVoters.length-downVoters.length,
    subComments: subComments ? subCommentArrToTree(subComments): []
  }
  if(userId){
    if(downVoters.some(id => id === userId)) preparedComment.downVoted = true;
    if(upVoters.some(id => id === userId)) preparedComment.upVoted = true;
  }
  return preparedComment;
};

const prepareSubComment = (subComment, userId) => {
  const { upVoters, downVoters, _id, actualComment, author, path, subComments } = subComment;
  let preparedSubComment = {
    id: _id,
    author,
    path,
    points: upVoters.length-downVoters.length,
    comment: actualComment,
    subComments: subComments ? subComments.map(s => prepareSubComment(s)) : []
  }
  if(userId){
    if(downVoters.some(id => id === userId)) preparedComment.downVoted = true;
    if(upVoters.some(id => id === userId)) preparedComment.upVoted = true;
  } 
  return preparedSubComment;
}


const subCommentArrToTree = subComments => {
  let commentArr = subComments
  .map(prepareSubComment)
  .map(s => { return {...s, path: s.path.split('/')} })
  let maxPathLength = commentArr.reduce((a,s) => {return a > s.path.length ? a : s.path.length}, 0);
  while(maxPathLength > 2){
    commentArr.forEach(s => {
      if(s.path.length === maxPathLength){
        const id = s.id;
        const commentArrayNew = commentArr.map(t => {
          if(t.path.join('/') === s.path.slice(0,-1).join('/')){
            return {
              ...t,
              subComments: [...t.subComments, {...s, path: s.path.join('/')}]
            }
          }else { return t }
        })
        commentArr = commentArrayNew.filter(s => s.id !== id);
      }
    });
    commentArr.filter(s => s.path.length !== maxPathLength);
    maxPathLength--;
  }
  return commentArr.map(s => {return { ...s, path: s.path.join('/')}});
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
exports.prepareSubComment = prepareSubComment;

