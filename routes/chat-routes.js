const express = require("express");

const router = express.Router();

const Contacts = require("../DB/Contacts.json");
const Chats = require("../DB/Chats.json");

router.get("/contacts", (req, res) => {
  res.json(Contacts);
});

router.get("/chat/:chatId", (req, res) => {
  const chat = Chats.find((x) => {
    return x.chatId === Number(req.params.chatId);
  });
  if (chat) {
    res.json(chat);
  } else {
    res.json([]);
  }
});

router.post("/chat/:chatId/sendMsg", (req, res) => {
  const chatId = Number(req.params.chatId);
  const chat = Chats.find((x) => {
    return x.chatId === chatId;
  });
  if (!chat) {
    chat = {
      chatId: chatId,
    };
  }
});

router.get("/chat/:chatId/msg/:msgId", (req, res) => {
  const chat = Chats.find((x) => {
    return x.chatId === Number(req.params.chatId);
  });
  if (!chat) {
    res.json(["invalid chatId"]);
  } else {
    const msg = chat.latestMessages.find((x) => {
      return x.msgId === Number(req.params.msgId);
    });
    if (!msg) {
      res.json(["invalid msgId"]);
    } else {
      res.json(msg);
    }
  }
});

router.get("/chats", (req, res) => {
  res.json(Chats);
});

module.exports = router;
