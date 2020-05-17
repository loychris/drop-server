const mongoose = require("mongoose");

const dropSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'},
  source: { type: String },
  memeId: { type: Number, required: true },
  comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment'}]
});

module.exports = mongoose.model("Drop", dropSchema);
