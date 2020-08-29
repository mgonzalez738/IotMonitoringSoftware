var mongoose = require('mongoose');

const dayTime = require('../services/daytime');
const VwsgPipe3 = require('../models/sensorVwsgPipe3Model');

exports.indexSensor = async (req, res, next) => {
    
    var logMessage = dayTime.getUtcString() + `\x1b[34mApi: ${req.method} (${req.originalUrl}) | Retrieve documents`; 
    
    console.log(logMessage + '\x1b[0m');

    collectionName = VwsgPipe3.Sensor.collection.collectionName;
    
    try {
        const sensors = await VwsgPipe3.Sensor.find().lean();
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Retrieved ${sensors.length} documents\x1b[0m`); 
        res.send(sensors);
    } catch (error) {
        next(error);
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error retrieving documents -> ${error.message }\x1b[0m`); 
    }
};

exports.indexData = async (req, res, next) => {
    
    var logMessage = dayTime.getUtcString() + `\x1b[34mApi: ${req.method} (${req.originalUrl}) | Retrieve documents`;
    
    if(req.query.rawDataOnly != undefined)
    {
        logMessage = logMessage + ` (rawDataOnly)`;
    }
    
    console.log(logMessage + '\x1b[0m');

    collectionName = VwsgPipe3.Data.collection.collectionName;
    id = req.params.sensorId;
    
    try {
        let sensors = await VwsgPipe3.Data.find({SensorId: id}, {SensorId: 0, Type: 0, __v: 0}).lean();
        if(req.query.rawDataOnly === undefined) {
            sensors = await VwsgPipe3.AddCalculatedData(id, sensors);
        }   
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Retrieved ${sensors.length} documents\x1b[0m`);   
        res.send(sensors);
    } catch (error) {
        next(error);
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error retrieving documents -> ${error.message }\x1b[0m`); 
    }
};



