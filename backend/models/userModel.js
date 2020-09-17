const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { Company } = require('../models/companyModel');
const ErrorResponse = require('../utils/errorResponse');

/** Users schema */
const UserSchema = new mongoose.Schema({ 
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Role: { type: String, enum: ['super', 'administrator', 'user', 'guest'], default: 'user' },
    Password: { type: String, required: true, select: false },
    CompanyId: { type: mongoose.Schema.Types.ObjectId },
    ResetPasswordToken: { type: String, select: false },
    ResetPasswordExpire: { type: Date, select: false },
    CreatedAt: { type: Date, default: Date.now }   
} , { id: false, toJSON: { virtuals: true }, toObject: { virtuals: true }});
UserSchema.index({ LastName: 1, FirstName: 1 });

UserSchema.virtual('Company', {
    localField: 'CompanyId',
    foreignField: '_id',
    ref: 'Company',
    justOne: true
 });

 UserSchema.method('toJSON', function() {
    let user = this.toObject();
    if(this.populated('Company'))
    {
        delete user.CompanyId;
    }
    return user;
  });

/**Encripta el password */
UserSchema.pre('save', async function(next) {
    // Hashea el password antes de guardarlo
    if(this.isModified('Password')) {
        const salt = await bcrypt.genSalt(10);
        this.Password = await bcrypt.hash(this.Password, salt);
    }
    // Verifica que exista el id de compania
    if(this.CompanyId && this.isModified('CompanyId')) {
        const company = await Company.findById(this.CompanyId);
        if(!company) {
            return next(new ErrorResponse('CompanyId not found', 400));
        }
    } 
    next();  
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
UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.ResetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.ResetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

exports.User = mongoose.model('User', UserSchema, 'Users');