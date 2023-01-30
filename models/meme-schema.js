const mongoose = require("mongoose");

const elementSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['image', 'text', 'rect'],
        required: true
    },
    height: { type: Number, required: true },
    width: { type: Number, required: true },
    posX: { type: Number, required: true },
    posY: { type: Number, required: true },
    rotation: { type: Number, required: true },
    // text
    text: { type: String },
    font: { type: String },
    fontSize: { type: Number },
    fontWeight: { type: String },
    textAlign: { type: String },
    verticalAlign: { type: String },
    fixedDimensions: { type: Boolean },
    underline: { type: Boolean },
    italic: { type: Boolean },
    textStroke: { type: Boolean },
    // shape
    color: { type: String },
    // image
    imgSrc: { type: String }
});

const memeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'},
  template: { type: Boolean, required: true },
  response: { type: Boolean, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
  elements: [elementSchema],
  tags: [{ type: String }],
});

const Element = mongoose.model("Element", elementSchema);
const Meme = mongoose.model("Meme", memeSchema);

module.exports = {
    Meme,
    Element, 
}

