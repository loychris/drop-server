const { Storage } = require('@google-cloud/storage');
const path = require('path');

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
    creator = await User.findById(creatorId); 
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
  console.log("getMemeById called")
  const { id } = req.params;
  if(!id){
    return next(new HttpError('No memeId provided', 400));
  }
  let meme 
  try {
    meme = await Meme.findById(id);
  }catch(err){
    console.log(err);
    return next(new HttpError('Something went wrong. Please try again', 500));
  }
  if(!meme){
    return next(new HttpError('No meme found for given Id', 404));
  }
  res.json(meme)
}

const getMemeAsImage = async (req, res, next) => {

}

const uploadPictureForMeme = async (req, res, next) => {
  const { file } = req;
  const { memeId, elementId } = req.params;
  const creatorId = req.userData.userId;
  let creator;
  let meme;
  if(!file){
    return next(new HttpError('No file provided', 400));
  } 
  if(!creatorId){
    return next(new HttpError('No creatorId provided', 400));
  }
  try{
    creator = await User.findById(creatorId); 
  }catch(err){
    console.log(err);
    return next(new HttpError("Creating meme failed, please try again", 500));
  }
  if (!creator) {
    return next(new HttpError('Could not find user for provided id', 404));
  }
  try{
    meme = await Meme.findById(memeId);
  }catch(err){
    console.log(err);
    return next(new HttpError("Creating meme failed, please try again", 500));
  }
  if (!meme) {
    return next(new HttpError('Could not find meme for provided id', 404));
  }
  if(meme.creator != creatorId && !creator.admin){
    return next(new HttpError('User not authorised to create memes', 401));
  }
  let element = meme.elements.find(e => e._id == elementId);
  if(!element){
    return next(new HttpError('No element found for given Id', 404));
  }
  if(element.type != 'image'){
    return next(new HttpError('Element is not an image', 400));
  }

  console.log(creatorId, memeId, elementId, file)
  

  //////// Post Pic to GCP Bucket /////////////////////////////////////////////////////////////
  const storage = new Storage({
    keyFilename: path.join(__dirname, '../drop-260521-cc0eb8f443d7.json'),
    projectId: 'drop-260521'
  });
  const memesBucket = storage.bucket('drop-element-media-bucket')
  const gcsname = `element-${memeId}-${elementId}`;
  const mediafile = memesBucket.file(gcsname);
  const stream = mediafile.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    },
    resumable: false
  });
  stream.on('error', (err) => {
    console.log(err);
    req.file.cloudStorageError = err;
    next(err);
  });
  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
  });
  stream.end(req.file.buffer);
  //////////////////////////////////////////////////////////////////////
  element.url = `https://storage.googleapis.com/drop-element-media-bucket/${gcsname}`;
  meme.updated_at = Date.now();
  try{
    await meme.save(); 
  }catch(err){
    console.log(err);
    return next(new HttpError("Creating meme failed, please try again", 500));
  }
  res.status(201).json(meme);
}
  

const updateMeme = async (req, res, next) => {
  const { id } = req.params;
  const { meme } = req.body;
  const creatorId = req.userData.userId;
  if(!id){
    return next(new HttpError('No memeId provided', 400));
  }
  if(!meme){
    return next(new HttpError('No meme provided', 400));
  }
  if(!creatorId){
    return next(new HttpError('No creatorId provided', 400));
  }
  let existingMeme,creator;
  try{
    existingMeme = await Meme.findById(id);
  }catch(err){
    console.log(err);
    return next(new HttpError('Something went wrong. Please try again', 500));
  }
  try{
    creator = await User.findById(creatorId);
  }catch(err){
    console.log(err);
    return next(new HttpError('Something went wrong. Please try again', 500));
  }
  if(!existingMeme){
    return next(new HttpError('No meme found for given Id', 404));
  }
  if(existingMeme.creator.toString() !== creatorId && !user.admin){
    return next(new HttpError('User not authorised to update this meme', 401));
  }
  if(!creator){
    return next(new HttpError('Could not find user for provided id', 404));
  }
  meme.updated_at = Date.now();
  existingMeme = {...existingMeme, ...meme};
  console.log(existingMeme)
  try{
    await existingMeme.save();
  }catch(err){
    console.log(err);
    return next(new HttpError('Something went wrong. Please try again', 500));
  }
  res.status(200).json(existingMeme);
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
  uploadPictureForMeme
}