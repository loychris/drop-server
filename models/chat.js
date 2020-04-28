const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  name: { type: String, required: true },
  type: { enum: ["group", "person"], required: true },
  preview: { type: String, required: true },
  latestMessages: { required: false },
});

module.exports = mongoose.model("Chat", productSchema);
