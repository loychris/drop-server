const Chat = require('../models/chat-schema'); 
const User = require('../models/user-schema');
const HttpError = require("../models/http-error");

const postChat = async (req, res, next) => {
    const { group, members, name } = req.body;
    let initiator;
    try {
        initiator = await User.findById(req.userData.userId);
    }catch(err){
        return next(new HttpError('Something went wrong, please try again later', 500)); 
    }
    if(!initiator){
        return next(new HttpError('User not found', 404)); 
    }
    if(group){  // new group chat
        //
        //
        //
    } else { // new 1on1 Chat
        let receiver;
        try {
            receiver = await User.findById(req.userData.userId);
        }catch(err){
            return next(new HttpError('Something went wrong, please try again later', 500)); 
        }
        if(!receiver){
            return next(new HttpError('User not found', 404)); 
        }
        if(receiver.chats.some(c => initiator.chats.includes(c))){
            return next(new HttpError('Chat already exists', 409))
        } else {
            const createdChat = new Chat({
                group: false,
                members: [initiator._id, receiver.id],
                admins: [initiator._id, receiver.id],
                messages: []
            })
            receiver.chats.push(createdChat._id)
            initiator.chats.push(createdChat._id)
            await receiver.save()
            await initiator.save()
            await createdChat.save()
            res.status(201).json(createdChat)
        }
    }
}

const getChat = async (req, res, next) => {
    const chatId = req.params.chatId;
    const userId = req.userData.userId;
    if(!chatId){
        return next(new HttpError("No chatId given", 400));
    }
    let chat;
    try {
        chat = await Chat.findById(chatId);
    }catch(err){
        return next(new HttpError("Something went wrong, could not find Chat"));
    }
    if(!chat){
        return next(new HttpError("Chat not found", 404))
    }
    if(chat.members.includes(userId)){
        return next(new HttpError("Chat not found", 404))
    }
    res.json(chat)
}

const deleteChat = async (req, res, next) => {
    
}

const sendMessage = async (req, res, next) => {
    const userId = req.userData.userId;
    const { message } = req.body;
    const chatId = req.params.userId;
    let chat;
    try {
        chat = await Chat.findById(chatId);
    }catch(err){
        return next(new HttpError("Something went wrong, could not find Chat"));
    }
    if(!chat){
        return next(new HttpError("Chat not found", 404))
    }
    if(chat.members.includes(userId)){
        return next(new HttpError("Chat not found", 404))
    }
    const messageId = chat.nextMessageId;
    const newMessage = {
        text: message,
        id: chat.nextMessageId,
        sender: userId,
        received: [],
        seen: [],
        liked: [],
        time: new Date(),
        deleted: []
    }
    chat.messages.push(newMessage);
    chat.nextMessageId = messageId+1;
    try{
        await chat.save()
    }catch(err){
        return next(new HttpError("Something went wrong. Please try again later", 500))
    }
    res.json(chat);
}

const messageReceived = async (req, res, next) => {

}

const messageSeen = async (req, res, next) => {

}

const deleteMessage = async (req, res, next) => {

}

exports.getChat = getChat;
exports.postChat = postChat;
exports.deleteChat = deleteChat;
exports.sendMessage = sendMessage;
exports.messageReceived = messageReceived;
exports.messageSeen = messageSeen;
exports.deleteMessage = deleteMessage;

