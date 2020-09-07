const express = require("express");

const memeControllers = require("../controllers/meme-controller");

const router = express.Router();

router.get("/:dropId", memeControllers.getMemeByDropId);

module.exports = router;
