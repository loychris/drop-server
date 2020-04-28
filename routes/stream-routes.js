const express = require("express");

const router = express.Router();

const posts = require("../DB/posts.json");

router.get("/post/:postId", (req, res) => {
  const postId = Number(req.params.postId);
  let post = posts.find((x) => {
    return x.id === postId;
  });
  res.json(post);
});

router.get("/post/:postId/comment/:commentId", (req, res) => {
  const postId = Number(req.params.postId);
  const commentId = Number(req.params.commentId);
  const post = posts.find((x) => {
    return x.id === postId;
  });
  const comment = post.comments.find((x) => {
    return x.id === commentId;
  });
  res.json(comment);
});

router.get("/post/:postId/comments", (req, res) => {
  const postId = Number(req.params.postId);
  const post = posts.find((x) => {
    return x.id === postId;
  });
  res.json(post.comments);
});

router.post("/post/:postId/comment", (req, res) => {
  console.log("NEW COMMENT", req.body);
});

// {"user": "Chris Loy", "vote": "up"/"neutral"/"down"}
router.post("/post/:postId/comment/:commentId/vote", (req, res) => {
  const vote = req.body.vote;
  const user = req.body.user;
  const post = posts.find((x) => {
    return x.id === Number(req.params.postId);
  });
  const comment = post.comments.find((comment) => {
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

module.exports = router;
