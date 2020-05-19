const express = require("express");
const { check } = require("express-validator");

const commentController = require("../controllers/comment-controller");

const router = express.Router();

router.post("/:dropId/comment", commentController.createComment);

router.get("/:dropId/comment", commentController.getComments);

router.get("/:dropId/comment/:commentId", commentController.getComment);

// router.delete("/:commentId", commentController.deleteComment);

// router.patch("/:commentId", commentController.updateComment);

// router.post("/:commentId/vote", commentController.voteComment);

// router.post("/:commentId/sub", commentController.createSubComment);

// router.post("/:commentId/delSub", commentController.deleteSubComment);

// router.post("/:commentId/voteSub", commentController.voteSubComment);

module.exports = router;
