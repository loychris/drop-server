const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creatorId: { type: mongoose.Types.ObjectId, required: true, ref: 'User'},
  created: { type: Date, required: true },
  public: { type: Boolean, required: true},
  access: [{ type: mongoose.Types.ObjectId, ref: 'User' }] 
});

module.exports = mongoose.model("Image", imageSchema);

