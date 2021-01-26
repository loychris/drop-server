const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  messageType: {type: String, require: true }, 
  text: { type: String, required: true },
  sender: { type: mongoose.Types.ObjectId, ref: 'User'},
  received: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
  seen: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
  liked: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
  sentTime: { type: Number, required: true },
})

const chatSchema = new mongoose.Schema({
  group: { type: Boolean, required: true },
  members: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
  admins: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  name: { type: String },
  deleted: { type: Boolean },
  messages: [ messageSchema ],
});

const Chat = mongoose.model("Chat", chatSchema);
const Message = mongoose.model("Message", messageSchema);


module.exports = {
  Chat: Chat,
  Message: Message
}
