const express = require('express');

const extensionController = require('../controllers/extension-controller');

const router = express.Router();


router.post('/stream', extensionController.postToStream);
router.post('/streamWithTitle', extensionController.postToStreamWithTitile);
router.post('/instagram', extensionController.postToInstagram);
router.post('/igStory', extensionController.postToInstagramStory);
router.post('/twitter'  , extensionController.postToTwitter);
router.post('/tumblr'  , extensionController.postToTumblr);


module.exports = router;