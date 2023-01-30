const express = require("express");
const { getMemeById, createMeme, updateMeme, deleteMeme } = require("../controllers/meme-controller");

const fileUpload = require('../middleware/file-upload');
const auth = require('../middleware/check-auth');
const optionalAuth = require('../middleware/check-optional-auth');

const router = express.Router();

router.post("/", auth, fileUpload.single('file'), createMeme);
router.get("/:id", getMemeById);
router.patch(":id", auth, updateMeme);
router.delete("/:id", auth, deleteMeme);


module.exports = router;
