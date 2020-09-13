const mongoose = require('mongoose');

/** Log schema */
const LogSchema = new mongoose.Schema({ 
    Timestamp: { type: Date, required: true },
    Level: { type: String, required: true },
    Process: { type: String, required: true },
    User: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Message: { type: String },
    Data: { type: mongoose.Schema.Types.Mixed }
});

exports.Log = mongoose.model('Log', LogSchema, 'Logs');