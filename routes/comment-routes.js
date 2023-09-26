const express = require("express");
const { check } = require("express-validator");

const { 
    checkAuth, 
    checkOptionalAuth, 
    checkAdminAuth
} = require('../middleware/check-auth');

const commentController = require("../controllers/comment-controller");

const router = express.Router();

router.get("/comment/:commentId", checkOptionalAuth, commentController.getComment);
router.patch("/comment/:commentId", checkAuth, commentController.updateComment);
router.delete("/comment/:commentId", checkAuth, commentController.deleteComment);
router.post("/drop/:dropId/comment", checkAuth, commentController.createComment);
router.post("/comment/:commentId/vote", checkAuth, commentController.voteComment);
router.post("/comment/:commentId/sub", checkAuth, commentController.createSubComment);
router.post("/comment/:commentId/delSub", checkAuth, commentController.deleteSubComment);
router.post("/comment/:commentId/voteSub", checkAuth, commentController.voteSubComment);


module.exports = router;
