const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');



const subCommentArrToTree = (subComments, userId) => {
  let commentArr = subComments
  .map(s => prepareSubComment(s, userId))
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

const checkValidation = (req, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }
}

//------- PREPARE SHIT BEFORE SENDIG IT TO THE USER ---------------------------------

const prepareSelf = (user, token) => {
  return {
    name: user.name,
    handle: user.handle,
    chats: user.chats.map(c => prepareChat(c, user._id)),
    friends: user.friends.map(prepareUserData),
    notifications: user.notifications.map(prepareNotification),
    receivedFriendRequests: user.receivedFriendRequests.map(prepareUserData),
    sentFriendRequests: user.sentFriendRequests.map(prepareUserData),
    userId: user.id,
    profilePic: user.profilePic,
    email: user.email,
    token: token,
    expiresIn: 3600*672
  }
}

const prepareComment = (c, userId) => {
  const { comment, author, posted, upVoters, downVoters, subComments, _id } = c;
  let preparedComment = {
    id: _id,
    comment,
    authorId: author,
    posted,
    points: upVoters.length-downVoters.length,
    subComments: subComments ? userId ? subCommentArrToTree(subComments, userId) : subCommentArrToTree(subComments) : []
  }
  if(userId){
    if(downVoters.includes(userId)) preparedComment.downVoted = true;
    if(upVoters.includes(userId)) preparedComment.upVoted = true;
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
    subComments: subComments ? subComments.map(s => prepareSubComment(s, userId)) : []
  }
  if(userId){
    if(downVoters.includes(userId)) preparedSubComment.downVoted = true;
    if(upVoters.includes(userId)) preparedSubComment.upVoted = true;
  }
  return preparedSubComment;
}

const prepareUserData = (user) => {
  return {
    name: user.name, 
    handle: user.handle, 
    userId: user._id,
    profilePic: user.profilePic
  }
}

const prepareDrop = (drop, userId) => {
  return {
    dropId: drop._id,
    title: drop.title,
    creatorId: drop.creatorId,
    memeUrl: drop.url,
    source: drop.source,
    comments: drop.comments.map(c => prepareComment(c, userId))
  }
}

const prepareChat = (chat, userId) => { 
  const preparedMembers = chat.members.map(prepareUserData)
  const chatPartner = preparedMembers.filter(member => `${member.userId}` !== userId)[0]
  const name = chat.name ? chat.name : chatPartner ? chatPartner.name: 'unknown';
  const messages = chat.messages.map(prepareMessage);
  return {
    group: chat.group,
    messages: messages,
    chatId: chat._id,
    members: preparedMembers, 
    name,
    lastInteraction: chat.lastInteraction
  }
}

const prepareMessage = (message) => {
  switch(message.messageType){
    case 'text': 
      return {
        seen: message.seen, 
        liked: message.liked, 
        text: message.text,
        sender: message.sender,
        sentTime: message.sentTime,
        id: message._id,
        type: message.messageType
      }
    case 'drop': 
      return {
        seen: message.seen, 
        liked: message.liked, 
        title: message.title,
        dropId: message.dropId, 
        sender: message.sender,
        sentTime: message.sentTime,
        id: message._id,
        type: message.messageType
      }
  }
}

const prepareNotification = notification => {
  switch(notification.notificationType){
    case 'NEW_MESSAGE_DROP':
    case 'NEW_MESSAGE_TEXT': 
      return {
        type: notification.notificationType,
        id: notification._id,
        chatId: notification.chatId,
        message: prepareMessage(notification.message),
      }
    case 'NEW_CHAT_WITH_MESSAGE': 
      return {
        type: notification.notificationType,
        id: notification._id,
        chatId: notification.chatId,
        message: prepareMessage(notification.message),
      }
    }
}

exports.prepareSubComment = prepareSubComment;
exports.prepareComment = prepareComment;
exports.prepareSelf = prepareSelf;
exports.prepareUserData = prepareUserData;
exports.prepareDrop = prepareDrop;
exports.checkValidation = checkValidation;
exports.getDropFromDB = getDropFromDB;
exports.getCommnetFromDB = getCommnetFromDB;
exports.getUserFromDB = getUserFromDB;
exports.prepareChat = prepareChat;
exports.prepareMessage = prepareMessage;
exports.prepareNotification = prepareNotification;
