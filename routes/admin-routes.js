const express = require("express");
const { check } = require("express-validator");

const auth = require('../middleware/check-auth');

const adminController = require("../controllers/admin-controller");

const router = express.Router();

router.post('/list', adminController.joinWaitingList);

module.exports = router;
