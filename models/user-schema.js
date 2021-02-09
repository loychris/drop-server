const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const EmailListUserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    subscribed: { type: Boolean, required: true },
    signupDate: { type: String, required: true }, 
})

const messageSchema = new mongoose.Schema({
    messageType: {type: String, require: true }, 
    sender: { type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    received: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User'}],
    seen: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User'}],
    liked: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User'}],
    sentTime: { type: Number, required: true },
    
    // TEXT MESSAGE
    text: { type: String },
    // DROP MESSAGE
    title: { type: String },
    dropId: { type: mongoose.Types.ObjectId, ref: 'drop'},
})

const notificationSchema = new Schema({
    notificationType: { type: String, required: true },
    chatId: { type: mongoose.Types.ObjectId, required: true, ref: 'Chat' },
    message: messageSchema,
})

const userSchema = new Schema({
    name: { type: String, required: true },
    handle: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    joined: { type: Date, required: true },

    createdDrops: [{ type: mongoose.Types.ObjectId, ref: 'Drop'}],
    swipedLeftDrops: [{ type: mongoose.Types.ObjectId, ref: 'Drop'}],
    swipedRightDrops: [{ type: mongoose.Types.ObjectId, ref: 'Drop'}],
    savedDrops: [{ type: mongoose.Types.ObjectId, ref: 'Drop'}],

    writtenComments: [{ type: mongoose.Types.ObjectId, ref: 'Comment'}],
    upVotedComments: [{ type: mongoose.Types.ObjectId, ref: 'Comment'}],
    downVotedComments: [{ type: mongoose.Types.ObjectId, ref: 'Comment'}],
    writtenSubComments: [{ 
            comment: { type: mongoose.Types.ObjectId, required: true, ref: 'Comment'},
            path: {type: String, required: true}
    }],
    upVotedSubComments: [{   
            comment: { type: mongoose.Types.ObjectId, required: true, ref: 'Comment'},
            path: {type: String, required: true}
    }],
    downVotedSubComments: [{   
            comment: { type: mongoose.Types.ObjectId, required: true, ref: 'Comment'},
            path: {type: String, required: true}
    }],
    chats: [{type: mongoose.Types.ObjectId, ref: 'Chat'}],
    friends: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    receivedFriendRequests: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    sentFriendRequests: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    profilePic: { type: Boolean, required: true },
    notifications: [notificationSchema]
});

const User = mongoose.model("User", userSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const EmailListUser = mongoose.model("EmailListUser", EmailListUserSchema);


userSchema.plugin(uniqueValidator);

module.exports = {
        User: User,
        Notification: Notification,
        EmailListUser: EmailListUser,  
}