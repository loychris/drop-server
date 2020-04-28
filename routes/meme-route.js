const express = require("express");

const memeControllers = require("../controllers/meme-controller");

const router = express.Router();

router.get("/:postId", memeControllers.getMemeById);

module.exports = router;
