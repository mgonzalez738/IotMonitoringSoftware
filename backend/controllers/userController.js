const mongoose = require('mongoose');

const validationHandler = require('../validations/validationHandler');
const { User } = require('../models/userModel');

const collectionName = User.collection.collectionName;

exports.storeUser = async (req, res, next) => {
    
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
        res.send( {success: true, user});
    } catch (error) {
        //console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error storing document -> ${error.message }\x1b[0m`); 
        next(error);
        return;
    }
};

exports.loginUser = async (req, res, next) => {
    
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
        const { Email, Password } = req.body;
        // Verifica email usuario
        const user = await User.findOne({ Email }).select('+Password');
        if(!user) {
            const error = new Error( `Invalid credentials`);
            error.statusCode = 401;
            return next(error);
        }
        // Verifica password
        const isMatch = await user.matchPassword(Password);
        if(!isMatch) {
            const error = new Error( `Invalid credentials`);
            error.statusCode = 401;
            return next(error);
        }
        // Devuelve el token
        sendTokenResponse(user, res);
    } catch (error) {
        //console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error storing document -> ${error.message }\x1b[0m`); 
        next(error);
        return;
    }
};

const sendTokenResponse = (user, res) => {
    // Crea el token
    const token = user.getSignedJwtToken();
    // Opciones del cookie
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if(process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    // Modifica res con token en cookie y en body
    res.cookie('token', token, options).json({ success: true, token });
};

