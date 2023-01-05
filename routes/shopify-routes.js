const express = require("express");
const router = express.Router();

const shopifyController = require('../controllers/shopify-controller');

router.get('/script', shopifyController.getScript)

module.exports = router;
