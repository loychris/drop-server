const express = require('express');

const extensionController = require('../controllers/extension-controller');

const {
    checkAdminAuth
} = require('../middleware/check-auth');

const router = express.Router();


router.post('/stream', checkAdminAuth, extensionController.postToStream);
router.post('/instagram', checkAdminAuth, extensionController.postToInstagram);
router.post('/igStory', checkAdminAuth, extensionController.postToInstagramStory);
router.post('/twitter', checkAdminAuth, extensionController.postToTwitter);
router.post('/tumblr', checkAdminAuth, extensionController.postToTumblr);


module.exports = router;