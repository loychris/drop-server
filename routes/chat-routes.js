const express = require("express");
const router = express.Router();

const chatController = require('../controllers/chat-controller');
const auth = require("../middleware/check-auth");

router.get("/contacts", (req, res) => {
  res.json(Contacts);
});

router.get('/api/chat/chats', auth, chatController.getChats)
router.get('/api/chat/:chatId', auth, chatController.getChat);
router.post('/api/chat/', auth, chatController.newChat);
// router.delete('/:chatId', auth, chatController.deleteChat);
router.post('/api/chat/dropMessage', auth, chatController.sendDropMessage);
router.post('/api/chat/:chatId/textMessage', auth, chatController.sendTextMessage);
router.post('/api/chat/:chatId/read', auth, chatController.readTextMessages)
// router.post('/:chatId/message/received', auth, messageReceived)
// router.post('/:chatId/message/delete', auth, chatController.deleteMessage);

module.exports = router;
