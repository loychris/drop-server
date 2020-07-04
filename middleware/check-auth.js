const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorisation.split(' ')[1];
        if(!token){
            throw new Error('Authentification failed!');
        }
        const decodedToken = jwt.verity(token, 'supersecret_private_key_dont_share');
        req.userData = { userId: decodedToken.userId }

        next(); 
    }catch(err){
        return next(new HttpError('Authentification failed!', 401));
    }
}