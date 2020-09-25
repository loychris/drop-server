const express = require("express");
const { check } = require("express-validator");

const auth = require('../middleware/check-auth');

const commentController = require("../controllers/comment-controller");

const router = express.Router();

router.get("/comment/:commentId", commentController.getComment);
//router.use(checkAuth);
router.patch("/comment/:commentId", commentController.updateComment);
// router.delete("/comment/:commentId", commentController.deleteComment);
router.post("/drop/:dropId/comment", commentController.createComment);
router.post("/comment/:commentId/vote", auth, commentController.voteComment);
router.post("/comment/:commentId/sub", commentController.createSubComment);
router.post("/comment/:commentId/delSub", commentController.deleteSubComment);
router.post("/comment/:commentId/voteSub", auth, commentController.voteSubComment);

module.exports = router;
