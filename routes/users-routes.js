const express = require('express');
const { check } = require('express-validator');
const auth = require("../middleware/check-auth");

const usersController = require('../controllers/users-controller');

const router = express.Router();

router.post('/signup', 
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(), 
        check('password').isLength({ min: 6 })
    ], 
    usersController.signup);

router.post('/login', usersController.login);

router.post('/addFriend', auth, usersController.addFriend);

router.post('/checkHandle', check('handle').isLength({min: 4, max: 20}), usersController.checkHandle);

router.post('/checkEmail', check('email').normalizeEmail().isEmail(), usersController.checkEmail);

router.get('/', usersController.getAllUsers);

module.exports = router;
