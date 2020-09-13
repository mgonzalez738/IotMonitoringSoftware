const mongoose = require('mongoose');

/** Config schema */
const LogSchema = new mongoose.Schema({ 
    LoggerLevel: { type: String, required: true },
});

exports.Config = mongoose.model('Config', LogSchema, 'Config');