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

  module.exports = mongoose.model("Message", messageSchema);
