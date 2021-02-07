const mongoose = require("mongoose");

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

const chatSchema = new mongoose.Schema({
  group: { type: Boolean, required: true },
  members: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
  admins: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  name: { type: String },
  deleted: { type: Boolean },
  messages: [ messageSchema ],
  lastInteraction: { type: Number, required: true }
});

const Chat = mongoose.model("Chat", chatSchema);
const Message = mongoose.model("Message", messageSchema);


module.exports = {
  Chat: Chat,
  Message: Message,
}
