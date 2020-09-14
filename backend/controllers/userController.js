const crypto = require('crypto');

const { sendEmail } = require('../utils/sendEmail')
const validationHandler = require('../validations/validationHandler');
const { User } = require('../models/userModel');
const ErrorResponse = require('../utils/errorResponse');
const { Levels, Logger } = require('../services/loggerService');

const collectionName = User.collection.collectionName;

exports.indexUser = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Retrieve documents from ${collectionName}`;  
    try { 
        validationHandler(req);
    }
    catch (error) {
        Logger.Save(Levels.Warning, 'Api', logMessage, req.user._id); 
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
    }
    Logger.Save(Levels.Debug, 'Api', logMessage, req.user._id); 
    
    // Devuelve los usuarios
    try {
        AggregationArray = [];
        // Filtra por FirstName si esta definido
        if(req.query.firstname) {
            AggregationArray.push({ $match : { FirstName: req.query.firstname }});
        }
        // Filtra por LastName si esta definido
        if(req.query.lastname) {
            AggregationArray.push({ $match : { LastName: req.query.lastname }});
        }
        // Filtra por Email si esta definido
        if(req.query.email) {
            AggregationArray.push({ $match : { Emaul: req.query.email }});
        }
        // Ordena por LastName FirstName ascendente
        AggregationArray.push({ $sort : { LastName: 1, FirstName: 1 }});
        // Aplica paginacion si esta definido limit o skip
        if(req.query.skip || req.query.limit)
        {
            // Con paginacion
        }
        else
        {
            // Sin paginacion
            var result = await User.aggregate(AggregationArray);
            res.send({ Success: true, Data: result });
        }

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error retrieving documents from ${collectionName} -> ${error.message}`, req.user._id);
        return next(error);
    }
};

exports.storeUser = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Store new document to ${collectionName}`;  
    try { 
        validationHandler(req);
    }
    catch (error) {
        Logger.Save(Levels.Warning, 'Api', logMessage, req.user._id); 
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
    }
    Logger.Save(Levels.Debug, 'Api', logMessage, req.user._id); 
    
    // Crea y guarda el usuario
    try {
        const { FirstName, LastName, Email, Password, Role, CompanyId } = req.body;
        let user = await User.create({ FirstName, LastName, Email, Password, Role, CompanyId });
        user = await User.findOne({_id: user.id});
        Logger.Save(Levels.Info, 'Database', `Document stored to ${collectionName}`, req.user._id);
        res.send({Success: true, Data: user });

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error storing document -> ${error.message}`, req.user._id);
        return next(error);
    }
};

exports.loginUser = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Login try by user ${req.body.Email})`;  
    try { 
        validationHandler(req);
    }
    catch (error) {
        Logger.Save(Levels.Warning, 'Api', logMessage + " -> " + error.message); 
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
    }
    Logger.Save(Levels.Debug, 'Api', logMessage, undefined, req.body.Ip);   

    // Verifica los datos de login y devuelve el token
    try {
        const { Email, Password } = req.body;
        // Verifica email usuario
        const user = await User.findOne({ Email }).select('+Password');
        if(!user) {
            Logger.Save(Levels.Warning, 'Database', `User ${req.body.Email} not found (Login)`, undefined, req.body.Ip);
            return next(new ErrorResponse('Invalid credentials', 401));
        }
        // Verifica password
        const isMatch = await user.matchPassword(Password);
        if(!isMatch) {
            Logger.Save(Levels.Warning, 'Database', `Login password for user ${req.body.Email} did not match`, undefined, req.body.Ip);
            return next(new ErrorResponse('Invalid credentials', 401));
        }
        // Devuelve el token
        Logger.Save(Levels.Info, 'Database', `User ${req.body.Email} logged in`, undefined, req.body.Ip);
        sendTokenResponse(user, res);

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Login error -> ${error.message}`, undefined, req.body.Ip);
        return next(new ErrorResponse(error.message));
    }
};

exports.getMe = async (req, res, next) => {
    
    let logMessage = `${req.method} (${req.originalUrl}) | Retrieve user ${req.user.Email} information`;
    Logger.Save(Levels.Debug, 'Api', logMessage, req.user._id); 
    
    // Obtiene y devuelve los datos del usuario actual
    try {
        const user = await User.findById(req.user._id);
        Logger.Save(Levels.Info, 'Database', `User ${req.user.Email} information retrieved`, req.user._id);
        res.send( {Success: true, Data: user});

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error retrieving user ${req.user.Email} information -> ${error.message}`, req.user._id);
        return next(error);   
    }
};

exports.forgotPassword = async (req, res, next) => {

    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | User ${req.body.Email} forgot password`;  
    try { 
        validationHandler(req);
    }
    catch (error) {
        Logger.Save(Levels.Warning, 'Api', logMessage + " -> " + error.message, undefined, req.body.Ip); 
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
    }
    Logger.Save(Levels.Debug, 'Api', logMessage);  

    try {
        // Verifica email usuario
        const user = await User.findOne({ Email: req.body.Email });
        if(!user) {
            Logger.Save(Levels.Warning, 'Database', `User ${req.body.Email} not found (Forgot password)`, undefined, req.body.Ip);
            return next(new ErrorResponse(`User ${req.body.Email} not found`, 404));
        }
        // Genera el token
        const resetToken = user.getResetPasswordToken();
        await user.save({validationBeforeSave: false});
        // Envia el email con url y token
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/users/resetpassword/${resetToken}`;
        const message = `Make a PUT request to: \n\n ${resetUrl}`
        await sendEmail({
            email: user.Email,
            subject: 'Password Reset Token',
            message
        });
        // Envia respuesta
        Logger.Save(Levels.Info, 'Database', `Reset token saved for user ${user.Email}. Email sent`, undefined, req.body.Ip);
        res.send( {Success: true, Data: 'Token saved and email sent'});

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Forgot password error -> ${error.message}`, undefined, req.body.Ip);
        return next(new ErrorResponse(error.message));
    }
}

exports.resetPassword = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Reset password by user ${req.body.Email}`;  
    try {
        validationHandler(req);
    }
    catch (error) {
        Logger.Save(Levels.Warning, 'Api', logMessage + " -> " + error.message, undefined, req.body.Ip); 
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
    }
    Logger.Save(Levels.Debug, 'Api', logMessage, undefined, req.body.Ip);
    
    // Verifica el token de reset, cambia el password y devuelve el nuevo login
    try {
        // Hash del token recibido
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
        // Busca el usuario con el token que no haya expirado
        const user = await User.findOne({ResetPasswordToken: resetPasswordToken, ResetPasswordExpire: {$gt: Date.now()}});
        // Error si no pudo encontrar un usuario
        if(!user) { 
            Logger.Save(Levels.Warning, 'Database', `Invalid token (Reset Password)`, undefined, req.body.Ip);
            return next(new ErrorResponse('Invalid Token', 400));
        }
        // Establece el nuevo password y borra el token
        user.Password = req.body.Password;
        user.ResetPasswordToken = undefined;
        user.ResetPasswordExpire = undefined;
        await user.save();
        // Devuelve el token
        Logger.Save(Levels.Info, 'Database', `User ${user.Email} password reset`, undefined, req.body.Ip);
        sendTokenResponse(user, res);

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error reseting password -> ${error.message}`, undefined, req.body.Ip);
        return next(error);   
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

