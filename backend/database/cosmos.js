const mongoose = require('mongoose');

const dayTime = require('../services/daytime')

// Conecta a CosmosDb

exports.connect = async () => {
    try {
        await mongoose.connect("mongodb://"+process.env.COSMO_DB_HOST+":"+process.env.COSMO_DB_PORT+"/"+process.env.COSMO_DB_NAME+"?ssl=true&replicaSet=globaldb", {
            auth: {
                user: process.env.COSMO_DB_USER,
                password: process.env.COSMO_DB_PASSWORD
            },
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            retryWrites: false
        });
        console.log(dayTime.getUtcString() + "\x1b[35mDatabase: Connection to CosmosDB successful\x1b[0m"); 
    }
    catch(error) {
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: Error connecting to CosmosDB -> ${error.message}\x1b[0m`); 
    }
}
