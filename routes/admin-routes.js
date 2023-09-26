const express = require("express");
const { check } = require("express-validator");

const adminController = require("../controllers/admin-controller");

const router = express.Router();

router.post('/list', adminController.joinWaitingList);

module.exports = router;
