var mongoose = require('mongoose');

const dayTime = require('../services/daytime');
const VwsgPipe3 = require('../models/sensorVwsgPipe3Model');

exports.indexSensor = async (req, res, next) => {
    
    var logMessage = dayTime.getUtcString() + `\x1b[34mApi: ${req.method} (${req.originalUrl}) | Retrieve documents`; 
    console.log(logMessage + '\x1b[0m');

    var collectionName = VwsgPipe3.Sensor.collection.collectionName; 
    
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
    console.log(logMessage + '\x1b[0m');

    var collectionName = VwsgPipe3.Data.collection.collectionName; 

    try {

        // Etapa comun: Match Filtra por SensorId y fechas si estan definidas
        var stageCommon = { $match : { $and: [ ] }};
        stageCommon.$match.$and.push({ SensorId: new mongoose.Types.ObjectId(req.params.sensorId) });
        if(req.query.fromDate !== undefined)
            stageCommon.$match.$and.push({ Date: { $gte: new Date(req.query.fromDate) }});
        if(req.query.toDate !== undefined)
            stageCommon.$match.$and.push({ Date: { $lt: new Date(req.query.toDate) }});

        // Facet 1: Project filtra valores devueltos, ordena y aplica skip y limit si estan definidos
        var facet1Array = [{ $project: {SensorId: 0, Type: 0, __v: 0} }];
        if(req.query.sort !== undefined)
            facet1Array.push({ $sort : { Date: parseInt(req.query.sort) }});
        else
            facet1Array.push({ $sort : { Date: -1 }}); // Descendente por defecto
        if(req.query.skip !== undefined)
            facet1Array.push({ $skip : parseInt(req.query.skip) });
        if(req.query.limit !== undefined) {
            facet1Array.push({ $limit : parseInt(req.query.limit) });
            console.log(req.query.limit);
        }
        
        // Facet 2: Count
        var facet2Array = [{ $count: "Total" }];

        // Ejecuta la Query
        AggregationArray = [ stageCommon, { $facet: { Items: facet1Array, Count: facet2Array }}, { $project: { Items: 1, Count: '$Count.Total'}}, { $unwind: '$Count'}];
        const data = await VwsgPipe3.Data.aggregate(AggregationArray);
        console.log(data);
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Retrieved ${data[0].Items.length} documents\x1b[0m`);   
        res.send(data[0]);
    }
    catch (error)
    {
        next(error);
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error retrieving documents -> ${error.message }\x1b[0m`); 
    }


    /*
    // Arma el filtro del find
    filter = {SensorId: id};
    if(req.query.first != null)
        filter = {Date}

    collectionName = VwsgPipe3.Data.collection.collectionName;
    var id = req.params.sensorId;
    try {
        let sensors = await VwsgPipe3.Data.find(filter, {SensorId: 0, Type: 0, __v: 0}).lean();
        sensors = await VwsgPipe3.AddCalculatedData(id, sensors);
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Retrieved ${sensors.length} documents\x1b[0m`);   
        res.send(sensors);
    } catch (error) {
        next(error);
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error retrieving documents -> ${error.message }\x1b[0m`); 
    }
    */
}



