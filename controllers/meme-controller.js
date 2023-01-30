const path = require("path");
const fs = require("fs");

const HttpError = require("../models/http-error");
const { Meme } = require("../models/meme-schema");
const { User } = require("../models/user-schema");

const createMeme = async (req, res, next) => {
  let meme = req.body.meme;
  const creatorId = req.userData.userId;
  if(!meme){
    return next(new HttpError('No meme provided', 400))
  }
  let creator;
  try{
    creator = await User.findById(creatorId) //.session(sess);
  }catch(err){
    console.log(err);
    return next(new HttpError("Creating meme failed, please try again", 500));
  }
  if (!creator) {
    return next(new HttpError('Could not find user for provided id', 404));
  }
  // if(!user.admin){
  //   return next(new HttpError('User not authorised to create memes', 401));
  // }
  meme.creator = creatorId; 
  const date = Date.now();
  meme.created_at = date;
  meme.updated_at = date;
  console.log("meme", meme)
  const newMeme = new Meme(meme); 
  try{
    await newMeme.save();
  }catch(err){
    console.log(err);
    return next(new HttpError("Creating meme failed, please try again", 500));
  }
  res.status(201).json(newMeme);
}; 




const getMemeById = async (req, res, next) => {
  const { memeId } = req.params;
  if(!memeId){
    return next(new HttpError('No memeId provided', 400));
  }
  let meme 
  try {
    meme = await Meme.findById(memeId).populate(elements);
  }catch(err){
    return next(new HttpError('Something went wrong. Please try again', 500));
  }
  if(!meme){
    return next(new HttpError('No meme found for given Id', 404));
  }
  res.json(meme)
}

const getMemeAsImage = async (req, res, next) => {

}

const updateMeme = async (req, res, next) => {

}

// TODO: delete meme and all associated elements
const deleteMeme = async (req, res, next) => {
  
}

// // POST a new meme
// app.post("/memes", (req, res) => {
//   const newMeme = new Meme(req.body);
//   newMeme.save()
//     .then((meme) => {
//       res.status(201).json(meme);
//     })
//     .catch((err) => {
//       res.status(500).json({ message: "Error creating meme" });
//     });
// });

// // PATCH an existing meme by ID
// app.patch("/memes/:id", (req, res) => {
//   Meme.findByIdAndUpdate(req.params.id, req.body, { new: true })
//     .then((meme) => {
//       res.json(meme);
//     })
//     .catch((err) => {
//       res.status(500).json({ message: "Error updating meme" });
//     });
// });

// // DELETE a meme by ID
// app.delete("/memes/:id", (req, res) => {
//   Meme.findByIdAndDelete(req.params.id)
//     .then((meme) => {
//       res.json(meme);
//     })
//     .catch((err) => {
//       res.status(500).json({ message: "Error deleting meme" });
//     });
// });

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });


module.exports = {
  createMeme,
  getMemeById,
  getMemeAsImage,
  updateMeme, 
  deleteMeme,
}