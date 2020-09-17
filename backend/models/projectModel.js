const mongoose = require('mongoose');

const ErrorResponse = require('../utils/errorResponse');

/** Projects schema */
const ProjectSchema = new mongoose.Schema({ 
    Name: { type: String, required: true, unique: true },
    UsersId: [{ type: mongoose.Schema.Types.ObjectId }],
    CreatedAt: { type: Date, default: Date.now }   
}, { id: false, toJSON: { virtuals: true }, toObject: { virtuals: true }});

exports.Projects = mongoose.model('Project', ProjectsSchema, 'Projects');