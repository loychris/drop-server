const mongoose = require("mongoose");

const dropSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'},
  source: { type: String },
  meme: { type: Number, required: true },
  leftSwipers: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
  rightSwipers: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
  pinners: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
  comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment'}]
});

module.exports = mongoose.model("Drop", dropSchema);
