var express = require('express') 
var cors = require('cors')
const fs = require('fs')
const path = require('path');

const posts = require('./posts.json')
const dropTargers = require('./dropTargets.json')

/////////////// get array with all the paths ///////////
const filenamesArr = [];
function promisify(fn) {
  return function promisified(...params) {
    return new Promise((resolve, reject) => fn(...params.concat([(err, ...args) => err ? reject(err) : resolve( args.length < 2 ? args[0] : args )])))
  }
}
const readdirAsync = promisify(fs.readdir)
readdirAsync('./memes').then(filenames => filenames.forEach(filename => {
  filenamesArr.push(filename);
}))
////////////////////////////////////////////////////////




var app = express()
const port = 5000
 
app.use(cors())
app.use(express.json())



app.get('/post/:postId', (req, res) => {
  const postId = Number(req.params.postId);
  let post = posts.find(x => {return x.id === postId});
  res.json(post);
})
app.get('/post/:postId/comment/:commentId', (req, res) => {
  const postId = Number(req.params.postId);
  const commentId = Number(req.params.commentId);
  console.log('COMMENT-ID', commentId)
  const post = posts.find(x => {return x.id === postId});
  console.log('POST', post);
  const comment = post.comments.find(x => {return x.id === commentId});
  console.log('COMMENT', comment);
  res.json(comment);
})
app.get('/meme/:postId', (req, res) =>{
  const filePath = path.join(__dirname, './memes', filenamesArr[req.params.postId % filenamesArr.length]);
  res.sendFile(filePath);
})
app.get('/post/:postId/comments', (req, res) => {
  const postId = Number(req.params.postId);
  const post = posts.find(x => {return x.id === postId});
  res.json(post.comments);
})
 


app.get('/dropTargets', (req, res) => {
  res.json(dropTargers);
})








app.listen(port, function () {
  console.log(`CORS-enabled web server listening on port ${port}`);
})