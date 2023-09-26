const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'},
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
  tags: [{ type: String }],
  meme: { type: mongoose.Types.ObjectId, required: true, ref: 'Meme'},
});

const Template = mongoose.model("Template", templateSchema);

module.exports = {
    Template
}

