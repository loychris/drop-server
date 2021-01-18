const express = require('express');
const { check } = require('express-validator');
const auth = require("../middleware/check-auth");
const fileUpload = require('../middleware/file-upload');


const usersController = require('../controllers/users-controller');

const router = express.Router();

router.post('/signup', fileUpload.single('profilePic'),
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(), 
        check('password').isLength({ min: 6 })
    ], 
    usersController.signup);

router.post('/login', usersController.login);

router.post('/addFriend', auth, usersController.sendFriendRequest);

router.get('/friendRequests', auth, usersController.getFriendRequests);

router.get('/refresh', auth, usersController.refreshSelf);

router.post('/acceptFriendRequest', auth, usersController.acceptFriendRequest);

router.post('/userdata', usersController.getDataForUsers);

router.post('/checkHandle', check('handle').isLength({min: 4, max: 20}), usersController.checkHandle);

router.post('/checkEmail', check('email').normalizeEmail().isEmail(), usersController.checkEmail);

router.get('/', usersController.getAllUsers);

module.exports = router;
