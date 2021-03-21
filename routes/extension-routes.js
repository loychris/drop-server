const express = require('express');

const extensionController = require('../controllers/extension-controller');

const router = express.Router();


router.post('/api/extension/stream', extensionController.postToStream);
router.post('/api/extension/instagram', extensionController.postToInstagram);
router.post('/api/extension/igStory', extensionController.postToInstagramStory);
router.post('/api/extension/twitter', extensionController.postToTwitter);
router.post('/api/extension/tumblr', extensionController.postToTumblr);


module.exports = router;