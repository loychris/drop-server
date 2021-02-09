const { Chat, Message } = require('../models/chat-schema'); 
const { User, Notification } = require('../models/user-schema');
const Drop = require('../models/drop-schema');
const HttpError = require('../models/http-error');
const { prepareChat, prepareMessage, prepareUserData } = require('../util/util');

const newChat = async (req, res, next) => {
    const { group, members, name, message } = req.body;
    const senderId = req.userData.userId;
    if(group){  
    } else { 
        // new 1on1 Chat
        const userId = req.userData.userId;
        const receiverId = members.filter(id => id !== userId)[0];
        let user;
        let receiver;
        try { 
            user = await User.findById(userId).populate('chats').exec();
        }
        catch(err){  
            return next(new HttpError('Something went wrong. Try again later 1', 500)) 
        }  
        try{
            receiver = await User.findById(receiverId);
        }catch(err){
            return next(new HttpError('Something went wrong. Try again later 2', 500)) 
        }
        if(!receiver){
            return next(new HttpError('User not found', 404)) 
        }
        let existingChat = user.chats.find(chat => 
            chat.members.length === 2 
            && chat.members.some(id => id === userId)
            && chat.members.some(id => id === receiverId)
        )
        if(existingChat){
            return next(new HttpError('Chat already exists', 409))
        }
        let firstMessage;
        const now = Date.now(); 
        let createdChat = new Chat({
            group: false,
            members: [senderId, receiverId],
            admins: [senderId, receiverId],
            messages: [],
            lastInteraction: now,
        })
        if(message){
            firstMessage = new Message({
                messageType: 'text',
                text: message,
                sender: userId,
                received: [],
                seen: [userId],
                liked: [],
                sentTime: now,
            });
            const notification = new Notification({
                notificationType: 'NEW_CHAT_WITH_MESSAGE',
                chatId: createdChat._id,
                message: firstMessage,
            });
            receiver.notifications.push(notification);
            createdChat.messages.push(firstMessage);
        }
        receiver.chats.push(createdChat._id)
        user.chats.push(createdChat._id)
        try {
            await receiver.save();
            await user.save();
            await createdChat.save();
        }catch(err){
            return next(new HttpError('Something went wrong. Try again later 3', 500)) 
        }
        let preparedChat = prepareChat(createdChat, userId);
        res.status(201).json(preparedChat);
    }
}

const getChat = async (req, res, next) => {
    const chatId = req.params.chatId;
    if(!chatId){
        return next(new HttpError('No chatId given', 400));
    }
    let chat;
    try {
        chat = await Chat.findById(chatId).populate('members').exec();
    }catch(err){
        return next(new HttpError('Something went wrong, could not find Chat'));
    }
    if(!chat){
        return next(new HttpError('Chat not found', 404))
    }
    if(!chat.members.some(member => `${member._id}` === `${req.userData.userId}`)){
        return next(new HttpError('Authentification failed!', 401));
    }
    const preparedChat = prepareChat(chat);
    res.json(preparedChat)
}

const deleteChat = async (req, res, next) => {
}

const sendDropMessage = async (req, res, next) => {
    const { userId } = req.userData;
    const { chatIds, dropId } = req.body;
    const realChatIds = chatIds.filter(id => !id.startsWith('dummy'));
    const newChatUserIds = chatIds.filter(id => id.startsWith('dummy')).map(id => id.substring(5, id.length)); 
    let chats = [];
    let drop;
    const now = Date.now();
    try{
        chats = await Chat.find().where('_id').in(realChatIds).exec();
    } catch(err){
        return next(new HttpError('Something went wrong. Please try again later', 500))
    }
    try{
        drop = await Drop.findById(dropId)
    }catch(err){
        return next(new HttpError('Something went wrong. Please try again later', 500))
    }
    const messageReplacements = chats.map(async (chat) => {
        const receiversIds = chat.members.filter(id => `${id}` !== userId);
        let receivers = [];
        try {
            receivers = await User.find().where('_id').in(receiversIds).exec();
        }
        catch (err) {
            return next(new HttpError('Something went wrong. Please try again later', 500));
        }
        const newMessage = new Message({
            messageType: 'drop',
            title: drop.title,
            dropId: drop._id,
            sender: userId,
            received: [],
            seen: [userId],
            liked: [],
            sentTime: now,
        });
        receivers.forEach(async (receiver) => {
            const newNotification = {
                notificationType: 'NEW_MESSAGE_DROP',
                chatId: chat._id,
                message: newMessage
            };
            receiver.notifications.push(newNotification);
            try {
                await receiver.save();
            }
            catch (err) {
                return next(new HttpError('Something went wrong. Please try again later', 500));
            }
        });
        chat.messages.push(newMessage);
        try {
            await chat.save();
        }
        catch (err) {
            return next(new HttpError('Something went wrong. Please try again later', 500));
        }
        return { chatId: chat._id, message: prepareMessage(newMessage) };
    })

    let user;
    try { 
        user = await User.findById(userId);
    }
    catch(err){  
        return next(new HttpError('Something went wrong. Try again later 1', 500)) 
    } 

    const chatReplacements = newChatUserIds.map( async receiverId => {
        let receiver;
        try{
            receiver = await User.findById(receiverId);
        }catch(err){
            return next(new HttpError('Something went wrong. Try again later 2', 500)) 
        }
        if(!receiver){
            return next(new HttpError('User not found', 404)) 
        }
        const firstMessage = new Message({
            messageType: 'drop',
            title: drop.title,
            dropId: drop._id,
            sender: userId,
            received: [],
            seen: [userId],
            liked: [],
            sentTime: now,
        });
        const createdChat = new Chat({
            group: false,
            members: [userId, receiverId],
            admins: [userId, receiverId],
            messages: [firstMessage],
            lastInteraction: now,
        })
        receiver.chats.push(createdChat._id);
        user.chats.push(createdChat._id);
        try {
            receiver.save();
            user.save();
            createdChat.save(); 
        }catch(err){
            return next(new HttpError('There was a problem. Please try again later', 500));
        }
        let prePreparedChat = {
            _id: createdChat._id, 
            group: false,
            members: [user, receiver],
            admins: [userId, receiverId],
            messages: [firstMessage],
            lastInteraction: now,
        }
        return { userId: receiverId, chat: prepareChat(prePreparedChat) } 
    })

    res.json({
        messageReplacements: await Promise.all(messageReplacements), 
        chatReplacements: await Promise.all(chatReplacements),
    });
}

const sendTextMessage = async (req, res, next) => {
    const { userId } = req.userData;
    const { type, message } = req.body;
    const chatId = req.params.chatId;
    let chat, receiver;
    try {
        chat = await Chat.findById(chatId);
    }catch(err){
        return next(new HttpError('Something went wrong, could not find Chat', 500));
    }
    if(!chat){
        return next(new HttpError('Chat not found', 404))
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
    const now = Date.now();
    let newMessage;
    switch(type){
        case 'text': 
            newMessage = new Message({
                messageType: 'text',
                text: message.text,
                sender: userId,
                received: [],
                seen: [userId],
                liked: [],
                sentTime: now,
            })
            break;
        case 'drop': 
            newMessage = new Message({
                messageType: 'drop',
                title: message.title ? message.title : undefined,
                dropId: message.dropId,
                sender: userId,
                received: [],
                seen: [userId],
                liked: [],
                sentTime: now,
            })
    }
    const newNotification = new Notification({
        notificationType: 'NEW_MESSAGE_TEXT',
        chatId: chatId,
        message: newMessage
    })
    receiver.notifications.push(newNotification); 
    chat.messages.push(newMessage);
    chat.lastInteraction = now;
    try{
        await receiver.save(); 
    }catch(err){
        return next(new HttpError('Something went wrong. Please try again later', 500));  
    }
    try{
        await chat.save()
    }catch(err){
        return next(new HttpError('Something went wrong. Please try again later', 500));
    }
    const preparedMessage = prepareMessage(newMessage);
    res.json(preparedMessage);
}

const readTextMessages = async (req, res, next) => {
    const userId = req.userData.userId;
    const chatId = req.params.chatId;
    const { messageIds } = req.body;
    let chat, user;
    try {
        chat = await Chat.findById(chatId);
    }catch(err){
        return next(new HttpError('Something went wrong, could not find Chat', 500));
    }
    if(!chat){
        return next(new HttpError('Chat not found', 404))
    }
    if(!chat.members.includes(userId)){
        return next(new HttpError('Unauthorized', 401));
    }
    try {
        user = await User.findById(userId);
    }catch(err){
        return next(new HttpError('Something went wrog could not find User', 500))
    }
    const notificationsNew = user.notifications
        .filter(n => {
            return !(n.notificationType.startsWith('NEW_MESSAGE')
            && `${n.chatId}` === `${chatId}`
            && messageIds.some(id => id === `${n.message._id}`))
        })
    user.notifications = notificationsNew;
    try{
        await user.save();
    }catch(err){
        return next(new HttpError('Something went wrog. Please try again later.', 500))
    }
    res.json({message: 'Message successfully marked as seen'});
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
        return next(new HttpError('Something went wrong. Please try again later', 500)) 
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
exports.sendDropMessage = sendDropMessage;
exports.messageReceived = messageReceived;
exports.messageSeen = messageSeen;
exports.deleteMessage = deleteMessage;
exports.readTextMessages = readTextMessages;
