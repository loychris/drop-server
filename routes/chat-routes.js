const express = require("express");
const router = express.Router();

const chatController = require('../controllers/chat-controller');
const { checkAuth } = require("../middleware/check-auth");

router.get("/contacts", (req, res) => {
  res.json(Contacts);
});

router.get('/chats', checkAuth, chatController.getChats)
router.get('/:chatId', checkAuth, chatController.getChat);
router.post('/', checkAuth, chatController.newChat);
// router.delete('/:chatId', checkAuth, chatController.deleteChat);
router.post('/dropMessage', checkAuth, chatController.sendDropMessage);
router.post('/:chatId/textMessage', checkAuth, chatController.sendTextMessage);
router.post('/:chatId/read', checkAuth, chatController.readTextMessages)
// router.post('/:chatId/message/received', checkAuth, messageReceived)
// router.post('/:chatId/message/delete', checkAuth, chatController.deleteMessage);

module.exports = router;
