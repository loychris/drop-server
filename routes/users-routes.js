const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controller');

const router = express.Router();

router.post(
    '/signup', 
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),// normalize: Test@test.com => test@test.com
        check('password').isLength({ min: 6 })
    ], 
    usersController.registerUser);

router.post('/login', usersController.login);

module.exports = router;
