var express = require("express");
var cors = require("cors");
const fs = require("fs");
const path = require("path");
const MongoClient = require("mongodb").MongoClient;

const posts = require("./posts.json");
const Contacts = require("./Contacts.json");
const RecentChats = require("./RecentChats.json");

/////////////// get array with all the paths ///////////
const filenamesArr = [];
function promisify(fn) {
  return function promisified(...params) {
    return new Promise((resolve, reject) =>
      fn(
        ...params.concat([
          (err, ...args) =>
            err ? reject(err) : resolve(args.length < 2 ? args[0] : args)
        ])
      )
    );
  };
}
const readdirAsync = promisify(fs.readdir);
readdirAsync("./memes").then(filenames =>
  filenames.forEach(filename => {
    filenamesArr.push(filename);
  })
);
////////////////////////////////////////////////////////

var app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get("/post/:postId", (req, res) => {
  const postId = Number(req.params.postId);
  let post = posts.find(x => {
    return x.id === postId;
  });
  res.json(post);
});

app.get("/post/:postId/comment/:commentId", (req, res) => {
  const postId = Number(req.params.postId);
  const commentId = Number(req.params.commentId);
  const post = posts.find(x => {
    return x.id === postId;
  });
  const comment = post.comments.find(x => {
    return x.id === commentId;
  });
  res.json(comment);
});

app.get("/meme/:postId", (req, res) => {
  const filePath = path.join(
    __dirname,
    "./memes",
    filenamesArr[req.params.postId % filenamesArr.length]
  );
  res.sendFile(filePath);
});

app.get("/post/:postId/comments", (req, res) => {
  const postId = Number(req.params.postId);
  const post = posts.find(x => {
    return x.id === postId;
  });
  res.json(post.comments);
});

app.get("/dropTargets", (req, res) => {
  res.json(Contacts);
});

app.post("/post/:postId/comment", (req, res) => {
  console.log("NEW COMMENT", req.body);
});

// {"user": "Chris Loy", "vote": "up"/"neutral"/"down"}
app.post("/post/:postId/comment/:commentId/vote", (req, res) => {
  const vote = req.body.vote;
  const user = req.body.user;
  const post = posts.find(x => {
    return x.id === Number(req.params.postId);
  });
  const comment = post.comments.find(comment => {
    return comment.commentId === Number(req.params.commentId);
  });
  switch (vote) {
    case "up":
      if (comment.upvoters.includes(user)) {
        console.log(`${user} already upvoted!`);
      } else if (comment.downvoters.includes(user)) {
        //TODO: upvoters.push(user);
        //      downvoters.remove(user);
        //      comment.points-=2
      } else {
        //TODO: upvoters.push(req);
        //      comment.points++
      }
      break;
    case "neutral":
      if (comment.upvoters.includes(user)) {
        //TODO: upvoters.remove(user);
        //      comment.points--
      } else if (comment.downvoters.includes(user)) {
        //TODO: downvotes.remove(user);
        //      comment.points++
      } else {
        console.log(`${user} didn't vote yet!`);
      }
      break;
    case "down":
      if (comment.upvoters.includes(user)) {
        //TODO: upvoters.remove(user);
        //      downvoters.push(user);
        //      comment.points-=2
      } else if (comment.downvoters.includes(user)) {
        console.log(`${user} already downvoted!`);
      } else {
        //TODO: downvoters.push(user)
      }
      break;
    default:
      console.log("faulty vote-value on comment-vote-api");
  }
  res.json(comment);
});

app.get("/contacts", (req, res) => {
  res.json(Contacts);
});

app.get("/recentchats", (req, res) => {
  res.json(RecentChats);
});

app.listen(port, function() {
  console.log(`CORS-enabled web server listening on port ${port}`);
});
