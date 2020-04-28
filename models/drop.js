const mongoose = require("mongoose");

const dropSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: String, required: true },
  source: { type: String },
  memeId: { type: Number, required: true },
  comments: [
    {
      author: { type: String },
    },
  ],
});

module.exports = mongoose.model("post", dropSchema);
