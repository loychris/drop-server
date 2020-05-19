const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;


const userSchema = new Schema({
    comment: { type: String },
    drop: { type: mongoose.Types.ObjectId, ref: 'Drop'},
    author: { type: mongoose.Types.ObjectId, ref: 'User'},
    posted: { type: Date, required: true },
    upVoters: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    downVoters: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    subComments: [{
        comment: { type: String },
        author: { type: mongoose.Types.ObjectId, ref: 'User'},
        drop: { type: mongoose.Types.ObjectId, ref: 'Drop'},
        path: {type: String, required: true },
        posted: { type: Date, required: true },
        upVoters: [{type: mongoose.Types.ObjectId, ref: 'User'}],
        downVoters: [{type: mongoose.Types.ObjectId, ref: 'User'}]
    }]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Comment', userSchema);