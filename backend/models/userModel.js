const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/** Users schema */
const UserSchema = new mongoose.Schema({ 
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Email: { 
        type: String, required: true, unique: true,
        match: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/ 
    },
    Role: { 
        type: String,
        enum: ['super', 'administrator', 'user', 'guest'],
        default: 'user' 
    },
    Password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
    ResetPasswordToken: String,
    ResetPasswordExpire: Date,
    CreatedAt: {
        type: Date,
        default: Date.now
    }   
});

/**Encripta el password */
UserSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
});

/** Firma y devuelve el token */
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

/** Compara el password ingresado */
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.Password);
};

/** Genera y hashea el token de password*/
UserSchema.methods.getResetPasswordToken = async function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.ResetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.ResetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

exports.User = mongoose.model('User', UserSchema, 'Users');