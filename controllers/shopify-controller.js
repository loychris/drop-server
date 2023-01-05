const { Chat, Message } = require('../models/chat-schema'); 
const { User, Notification } = require('../models/user-schema');
const HttpError = require('../models/http-error');
const path = require('path');


const getScript = async (req, res, next) => {
    console.log("get scropt called")

    var options = {
        root: path.join(__dirname)
    };
     
    var fileName = 'shopifyScript.js';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err)
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
}

exports.getScript = getScript;

