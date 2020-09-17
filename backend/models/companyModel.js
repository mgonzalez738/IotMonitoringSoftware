const mongoose = require('mongoose');

/** Users schema */
const CompanySchema = new mongoose.Schema({ 
    Name: { type: String, required: true, unique: true },
    CreatedAt: { type: Date, default: Date.now }   
});

exports.Company = mongoose.model('Company', CompanySchema, 'Companies');