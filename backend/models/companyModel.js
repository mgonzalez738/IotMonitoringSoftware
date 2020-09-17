const mongoose = require('mongoose');

const { User } = require('../models/userModel');
const ErrorResponse = require('../utils/errorResponse');

/** Users schema */
const CompanySchema = new mongoose.Schema({ 
    Name: { type: String, required: true, unique: true },
    CreatedAt: { type: Date, default: Date.now }   
}, { id: false, toJSON: { virtuals: true }, toObject: { virtuals: true }});

CompanySchema.virtual('Users', {
    localField: '_id',
    foreignField: 'CompanyId',
    ref: 'User',
    justOne: false
 });

 /** Impide borrar una compania que tiene usuarios */
CompanySchema.pre('remove', async function(next) {
    // Verifica si hay usuarios de esta compania
    const user = await this.model('User').findOne({ CompanyId: this._id });
    if(user) {
        return next(new ErrorResponse('Can not delete a company with users related. Remove all them first', 400));
    }
    next();   
});

exports.Company = mongoose.model('Company', CompanySchema, 'Companies');