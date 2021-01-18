const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  group: { type: Boolean, required: true },
  members: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
  admins: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  name: { type: String },
  deleted: { Boolean },
  messages: [{
    type: {type: String, require: true }, 
    text: { type: String, required: true },
    id: { type: Number, required: true },
    sender: { type: mongoose.Types.ObjectId, ref: 'User'},
    received: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
    seen: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
    liked: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
    time: { type: Date, required: true },
    deleted: [{ type: mongoose.Types.ObjectId, ref: 'User'}]
  }],
});

module.exports = mongoose.model("Chat", chatSchema);
