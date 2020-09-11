const mongoose = require('mongoose');

const validationHandler = require('../validations/validationHandler');
const { User } = require('../models/userModel');

exports.storeUser = async (req, res, next) => {
    
    var collectionName = User.collection.collectionName;
    //var logMessage = dayTime.getUtcString() + `\x1b[34mApi: ${req.method} (${req.originalUrl}) | Store document to ${collectionName}`;  
    try { // Validacion
        validationHandler(req);
    }
    catch (err) {
        next(err);
        //console.log(logMessage + "\x1b[31m -> " + err.message + "\x1b[0m");
        return;
    }
    //console.log(logMessage + '\x1b[0m');   

    try {
        const { FirstName, LastName, Email, Password, Role } = req.body;
        const user = await User.create({ FirstName, LastName, Email, Password, Role });
        const token = user.getSignedJwtToken();
        res.send( {success: true, token});
    } catch (error) {
        //console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error storing document -> ${error.message }\x1b[0m`); 
        next(error);
        return;
    }
};