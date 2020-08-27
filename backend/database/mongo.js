const mongoose = require('mongoose');

const dayTime = require('../services/daytime')

// Conecta a la instancia de MongoDB local

exports.connect = async () => {
    try {
        await mongoose.connect('mongodb://localhost/IotMonitoring', {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        }); 
        console.log(dayTime.getUtcString() + "\x1b[35mDatabase: Connection to local MongoDB successful\x1b[0m"); 
    }
    catch(error) {
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: Error connecting to local MongoDB -> ${error.message}\x1b[0m`); 
    }
}