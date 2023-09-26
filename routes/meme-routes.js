const express = require("express");
const { check } = require("express-validator");
const {
    createMeme,
    getMemeById,
    deleteMeme,
    updateMeme,
} = require("../controllers/meme-controller");
const fileUpload = require('../middleware/file-upload');
const {
    checkAuth,
    checkOptionalAuth
} = require('../middleware/check-auth');

const router = express.Router();

router.post("/", checkAuth, createMeme);
router.get("/:memeId", checkOptionalAuth, getMemeById);
router.delete("/:memeId", checkAuth, deleteMeme);
router.patch("/:memeId", checkAuth, updateMeme);


module.exports = router;

