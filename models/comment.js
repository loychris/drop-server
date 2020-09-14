const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;


const commentSchema = new Schema({
    comment: { type: String },
    drop: { type: mongoose.Types.ObjectId, ref: 'Drop'},
    author: { type: mongoose.Types.ObjectId, ref: 'User'},
    posted: { type: Date, required: true },
    lastModified: { type: Date },
    deleted: { type: Boolean },
    upVoters: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    downVoters: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    nextSubId: { type: String, maxlength: 10, required: true },
    subComments: [{
        actualComment: { type: String },
        author: { type: mongoose.Types.ObjectId, ref: 'User'},
        path: {type: String, required: true },
        posted: { type: Date, required: true },
        lastModified: { type: Date },
        upVoters: [{type: mongoose.Types.ObjectId, ref: 'User'}],
        downVoters: [{type: mongoose.Types.ObjectId, ref: 'User'}],
        nextSubId: { type: String, maxlength: 10, required: true }
    }]
});

commentSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Comment', commentSchema);