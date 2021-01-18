const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;


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

    notifications: [{
        notificationType: { type: String, required: true },
        chatId: { type: mongoose.Types.ObjectId, required: true, ref: 'Chat' },
        message: {
            type: {type: String, require: true }, 
            text: { type: String, required: true },
            id: { type: Number, required: true },
            sender: { type: mongoose.Types.ObjectId, ref: 'User'},
            received: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
            seen: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
            liked: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
            time: { type: Date, required: true },
            deleted: [{ type: mongoose.Types.ObjectId, ref: 'User'}]
        }
    }]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
