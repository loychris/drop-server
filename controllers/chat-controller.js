const Chat = require('../models/chat-schema'); 
const User = require('../models/user-schema');
const HttpError = require("../models/http-error");
const { prepareChat, prepareMessage, prepareUserData } = require('../util/util');

const newChat = async (req, res, next) => {
    const { group, members, name, message } = req.body;
    const senderId = req.userData.userId;
    let sender;
    try {
        sender = await User.findById(senderId);
    }catch(err){ return next(new HttpError('Something went wrong, please try again later', 500))}
    if(!sender){return next(new HttpError('User not found', 404))}
    if(group){  
        // new group chat
        //
        //
        //
    } else { 
        // new 1on1 Chat
        const receiverId = members[0];
        let receiver;
        try {
            receiver = await User.findById(members[0]);
        }catch(err){ return next(new HttpError('Something went wrong, please try again later', 500))}
        if(!receiver){ return next(new HttpError('User not found', 404))}
        if(receiver.chats.some(c => sender.chats.includes(c))){ return next(new HttpError('Chat already exists', 409))}
        if(!message || !message.text){ return next(new HttpError('no message attached', 400))}
        const firstMessage = {
            text: message.text,
            id: 0,
            sender: senderId,
            received: [],
            time: new Date()
        }
        const createdChat = new Chat({
            group: false,
            members: [senderId, receiverId],
            admins: [senderId, receiverId],
            messages: [firstMessage],
        })
        receiver.chats.push(createdChat._id)
        sender.chats.push(createdChat._id)
        await receiver.save()
        await sender.save()
        await createdChat.save()
        const preparedChat = {...createdChat, name: receiver.name };
        res.status(201).json(preparedChat);
    }
}

const getChat = async (req, res, next) => {
    const chatId = req.params.chatId;
    if(!chatId){
        return next(new HttpError("No chatId given", 400));
    }
    let chat;
    try {
        chat = await Chat.findById(chatId).populate('members').exec();
    }catch(err){
        return next(new HttpError("Something went wrong, could not find Chat"));
    }
    if(!chat){
        return next(new HttpError("Chat not found", 404))
    }
    if(!chat.members.some(member => member._id === req.userData.userId)){
        return next(new HttpError('Authentification failed!', 401));
    }
    const preparedChat = prepareChat(chat);
    res.json(preparedChat)
}

const deleteChat = async (req, res, next) => {
}

const sendTextMessage = async (req, res, next) => {
    const { userId } = req.userData;
    const { message } = req.body;
    const chatId = req.params.chatId;
    let chat, receiver;
    try {
        chat = await Chat.findById(chatId);
    }catch(err){
        return next(new HttpError("Something went wrong, could not find Chat", 500));
    }
    if(!chat){
        return next(new HttpError("Chat not found", 404))
    }
    if(!chat.members.includes(userId)){
        return next(new HttpError('Unauthorized', 401));
    }
    const receiverId = chat.members.filter(id => id.toString() !== userId.toString());
    try {
        receiver = await User.findById(receiverId);
    }catch(err){
        return next(new HttpError('Something went wrog could not find User', 500))
    }
    const newMessage = {
        text: message,
        type: 'text',
        id: Date.now(),
        sender: userId,
        received: [],
        seen: [],
        liked: [],
        time: new Date(),
        deleted: []
    }
    receiver.notifications.push({
        notificationType: 'NEW_TEXT_MESSAGE',
        chatId: chatId,
        message: newMessage
    })
    try{
        await receiver.save(); 
    }catch(err){
        console.log(err);
        return next(new HttpError(''))  
    }
    // chat.messages.push(newMessage);
    // try{
    //     await chat.save()
    // }catch(err){
    //     return next(new HttpError("Something went wrong. Please try again later", 500));
    // }
    console.log('Receiver Notifications')
    console.log(receiver.notifications);3
    const preparedMessage = prepareMessage(newMessage);
    res.json(preparedMessage);
}

const getChats = async (req, res, next) => {
    const userId = req.userData.userId;
    let user;
    try {
        // user = await User.findById(userId).populate('chats').exec();
        user = await User.findById(userId).populate({ 
            path: 'chats',
            populate: {
              path: 'members',
              model: 'User'
            } 
         }).exec();

    } catch(err){  
        return next(new HttpError("Something went wrong. Please try again later", 500)) 
    }
    const preparedChats = user.chats.map(chat => prepareChat(chat, userId));
    res.json(preparedChats);
}

const messageReceived = async (req, res, next) => {
}

const messageSeen = async (req, res, next) => {
}

const deleteMessage = async (req, res, next) => {
}

exports.getChats = getChats;
exports.getChat = getChat;
exports.newChat = newChat;
exports.deleteChat = deleteChat;
exports.sendTextMessage = sendTextMessage;
exports.messageReceived = messageReceived;
exports.messageSeen = messageSeen;
exports.deleteMessage = deleteMessage;

