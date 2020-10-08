const express = require("express");
const router = express.Router();

const chatController = require('../controllers/chat-controller');
const auth = require("../middleware/check-auth");

router.get("/contacts", (req, res) => {
  res.json(Contacts);
});

router.get("/:chatId", auth, chatController.getChat);

router.post("/", auth, chatController.postChat);

// router.delete('/:chatId', auth, chatController.deleteChat);

// router.post('/:chatId/message', auth, sendMessage);

// router.post('/:chatId/message/received', auth, messageReceived)

// router.post('/:chatId/message/delete', auth, chatController.deleteMessage);


module.exports = router;
