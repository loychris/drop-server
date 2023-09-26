const express = require('express');
const { check } = require('express-validator');
const {
    checkAuth,
    checkOptionalAuth,
    checkAdminAuth
} = require("../middleware/check-auth");
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

router.post('/addFriend', checkAuth, usersController.sendFriendRequest);

router.post('/emaillist', usersController.joinEmailList);

router.get('/friendRequests', checkAuth, usersController.getFriendRequests);

router.get('/refresh', checkAuth, usersController.refreshSelf);

router.get('/notifications', checkAuth, usersController.getNotifications);

router.post('/acceptFriendRequest', checkAuth, usersController.acceptFriendRequest);

router.post('/userdata', usersController.getDataForUsers);

router.post('/checkHandle', check('handle').isLength({min: 4, max: 20}), usersController.checkHandle);

router.post('/checkEmail', check('email').normalizeEmail().isEmail(), usersController.checkEmail);

router.delete('/notification/:notificationId', checkAuth, usersController.deleteNotification);

router.get('/', usersController.getAllUsers);


module.exports = router;
