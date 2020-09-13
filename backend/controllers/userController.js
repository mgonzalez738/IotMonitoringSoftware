const mongoose = require('mongoose');

const validationHandler = require('../validations/validationHandler');
const { User } = require('../models/userModel');
const ErrorResponse = require('../utils/errorResponse');
const { Levels, Logger } = require('../services/loggerService');

const collectionName = User.collection.collectionName;

exports.storeUser = async (req, res, next) => {
    
    //var logMessage = dayTime.getUtcString() + `\x1b[34mApi: ${req.method} (${req.originalUrl}) | Store document to ${collectionName}`;  
    try { // Validacion
        validationHandler(req);
    }
    catch (error) {
        //console.log(logMessage + "\x1b[31m -> " + err.message + "\x1b[0m");
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
        return;
    }
    
    try {
        const { FirstName, LastName, Email, Password, Role } = req.body;
        const user = await User.create({ FirstName, LastName, Email, Password, Role });
        res.send( {success: true, user});
    } catch (error) {
        //console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error storing document -> ${error.message }\x1b[0m`); 
        next(error);
        return;
    }
};

exports.loginUser = async (req, res, next) => {
    
    let logMessage = `${req.method} (${req.originalUrl}) | Login try by user ${req.body.Email}`;  
    try { // Validacion
        validationHandler(req);
    }
    catch (error) {
        Logger.Save(Levels.Warning, 'Api', logMessage + " -> " + error.message); 
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
    }
    Logger.Save(Levels.Debug, 'Api', logMessage);   

    try {
        const { Email, Password } = req.body;
        // Verifica email usuario
        const user = await User.findOne({ Email }).select('+Password');
        if(!user) {
            Logger.Save(Levels.Warning, 'Database', `Login user ${req.body.Email} not found (${req.body.Ip})`);
            return next(new ErrorResponse('Invalid credentials', 401));
        }
        // Verifica password
        const isMatch = await user.matchPassword(Password);
        if(!isMatch) {
            Logger.Save(Levels.Warning, 'Database', `Login password for user ${req.body.Email} did not match (${req.body.Ip})`);
            return next(new ErrorResponse('Invalid credentials', 401));
        }
        // Devuelve el token
        Logger.Save(Levels.Info, 'Database', `User ${req.body.Email} logged in (${req.body.Ip})`);
        sendTokenResponse(user, res);
    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Login error -> ${error.message}`);
        return next(new ErrorResponse(error.message));
    }
};

exports.getMe = async (req, res, next) => {
    
    try {
        const user = await User.findById(req.user._id);
        res.send( {Success: true, Data: user});
        
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
    res.cookie('token', token, options).json({ Success: true, Token: token });
};

