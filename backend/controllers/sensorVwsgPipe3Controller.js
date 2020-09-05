var mongoose = require('mongoose');

const dayTime = require('../services/daytime');
const validationHandler = require('../validations/validationHandler');
const VwsgPipe3 = require('../models/sensorVwsgPipe3Model');
const { body } = require('express-validator');

exports.indexSensor = async (req, res, next) => {
    
    var collectionName = VwsgPipe3.Sensor.collection.collectionName; 
    var logMessage = dayTime.getUtcString() + `\x1b[34mApi: ${req.method} (${req.originalUrl}) | Retrieve documents from ${collectionName}`; 
    
    try { // Validacion
        validationHandler(req);
    }
    catch (err) {
        next(err);
        console.log(logMessage + "\x1b[31m -> " + err.message + "\x1b[0m");
        return;
    }

    console.log(logMessage + '\x1b[0m');   
    
    try {
        // Etapa comun: Match Filtra por Tag si esta definido
        var stageCommon = { $match : { $and: [ ] }};
        if(req.query.Tag !== undefined)
            stageCommon.$match.$and.push({ Tag: req.query.Tag});
        else
            stageCommon.$match.$and.push({ });

        // Facet 1: Ordena y aplica skip y limit si estan definidos
        var facet1Array = [ ];
        if(req.query.sort !== undefined)
            facet1Array.push({ $sort : { Tag: parseInt(req.query.sort) }});
        else
            facet1Array.push({ $sort : { Date: 1 }}); // Asscendente por defecto
        if(req.query.skip !== undefined)
            facet1Array.push({ $skip : parseInt(req.query.skip) });
        if(req.query.limit !== undefined) {
            facet1Array.push({ $limit : parseInt(req.query.limit) });
        }
        
        // Facet 2: Count
        var facet2Array = [{ $count: "Total" }];

        // Ejecuta la Query
        AggregationArray = [ stageCommon, { $facet: { Items: facet1Array, Count: facet2Array }}, { $project: { Items: 1, 'Info.Total': '$Count.Total'}}, { $unwind: '$Info.Total'}];
        var result = await VwsgPipe3.Sensor.aggregate(AggregationArray);
        
        // Completa la respuesta con informacion de paginacion
        var response = {};
        response.Items = {};
        response.Info = {};
        response.Info.From = null;
        response.Info.To = null;
        if(result.length == 0) { // No hubo respuesta
            response.Items = [];   
            response.Info.Retrieved = 0;
            response.Info.Total = 0;
        } else {
            response.Items =  result[0].Items;
            if(result[0].Items.length) {
                response.Info.From = (req.query.skip !== undefined) ? Number(req.query.skip) + 1 : 1;
                response.Info.To = (req.query.limit !== undefined) ? response.Info.From + Number(req.query.limit) - 1 : result[0].Info.Total;
                if((response.Info.To !== null) && (response.Info.To > result[0].Info.Total))
                    response.Info.To = result[0].Info.Total;
            }
            response.Info.Retrieved = result[0].Items.length;
            response.Info.Total = result[0].Info.Total;
        }      
        
        // Envia la respuesta
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Retrieved ${response.Info.Retrieved} documents\x1b[0m`);   
        res.send(response);

    } catch (error) {
        next(error);
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error retrieving documents -> ${error.message }\x1b[0m`); 
    }
};

exports.showSensor = async (req, res, next) => {

    var collectionName = VwsgPipe3.Sensor.collection.collectionName;
    
    var logMessage = dayTime.getUtcString() + `\x1b[34mApi: ${req.method} (${req.originalUrl}) | Retrieve document from ${collectionName}`; 
    
    try { // Validacion
        validationHandler(req);
    }
    catch (err) {
        next(err);
        console.log(logMessage + "\x1b[31m -> " + err.message + "\x1b[0m");
        return;
    }

    console.log(logMessage + '\x1b[0m');
   
    try {
        // Obtiene el documento
        var result = await VwsgPipe3.Sensor.find( { _id: new mongoose.Types.ObjectId(req.params.sensorId) } );
        // Envia la respuesta
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Retrieved ${result.length} document\x1b[0m`);   
        res.send((result.length > 0) ? result[0] : {});

    } catch (error) {
        next(error);
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error retrieving document -> ${error.message }\x1b[0m`); 
    }
};

exports.storeSensor = async (req, res, next) => {
    
    var collectionName = VwsgPipe3.Sensor.collection.collectionName;
    
    var logMessage = dayTime.getUtcString() + `\x1b[34mApi: ${req.method} (${req.originalUrl}) | Store document to ${collectionName}`; 
    
    try { // Validacion
        validationHandler(req);
    }
    catch (err) {
        next(err);
        console.log(logMessage + "\x1b[31m -> " + err.message + "\x1b[0m");
        return;
    }
    
    console.log(logMessage + '\x1b[0m');   

    try {
/*        let sensor = new VwsgPipe3.Sensor();
        sensor._id = new mongoose.Types.ObjectId(req.body._id);
        sensor.Tags.Name = req.body.Tags.Name;
        sensor.GatewayId = new mongoose.Types.ObjectId(req.body.GatewayId);

        // Crea las configuraciones con los valores recibidos o default si no estan definidos
        for(i = 0; i<req.body.Configuration.length; i++) {
            if(req.body.Configuration[i].Type == process.env.DEVICE_DISC_CAMPBELL) {
                // Crea la configuracion Campbell
                var config = new VwsgPipe3.ConfigCampbell();
                // Carga los parametros especificos Campbell
                if(req.body.Configuration[i].DataSourceFileName !== undefined) 
                    config.DataSourceFileName = req.body.Configuration[i].DataSourceFileName;
                if(req.body.Configuration[i].DataSourceStrainCols !== undefined) 
                    config.DataSourceStrainCols = req.body.Configuration[i].DataSourceStrainCols;
                if(req.body.Configuration[i].DataSourceTempCols !== undefined) 
                    config.DataSourceTempCols = req.body.Configuration[i].DataSourceTempCols;
                if(req.body.Configuration[i].DataSourceTimezone!== undefined) 
                    config.DataSourceTimezone = req.body.Configuration[i].DataSourceTimezone;
            }
            if(req.body.Configuration[i].Type == process.env.DEVICE_DISC_AZURE) {
                // Crea la configuracion Azure
                var config = new VwsgPipe3.ConfigAzure();
                // Carga los parametros especificos Azure
            }
            // Carga los parametros comunes
            config._id = new mongoose.Types.ObjectId();
            if(req.body.Configuration[i].Date !== undefined) 
                config.Date = req.body.Configuration[i].Date;
            if(req.body.Configuration[i].InitStrains !== undefined) 
                config.InitStrains = req.body.Configuration[i].InitStrains;
            if(req.body.Configuration[i].InitTemps !== undefined) 
                config.InitTemps = req.body.Configuration[i].InitTemps;
            if(req.body.Configuration[i].InitTemps !== undefined) 
                config.InitTemps = req.body.Configuration[i].InitTemps;
            if(req.body.Configuration[i].TempSensorsCount !== undefined) 
                config.TempSensorsCount = req.body.Configuration[i].TempSensorsCount;
            if(req.body.Configuration[i].TempCorrEnable !== undefined) 
                config.TempCorrEnable = req.body.Configuration[i].TempCorrEnable;
            if(req.body.Configuration[i].TempCorrFreeExpan !== undefined) 
                config.TempCorrFreeExpan = req.body.Configuration[i].TempCorrFreeExpan;
            if(req.body.Configuration[i].TeCoeffPipe !== undefined) 
                config.TeCoeffPipe = req.body.Configuration[i].TeCoeffPipe;
                if(req.body.Configuration[i].TeCoeffVwsg !== undefined) 
                config.TeCoeffVwsg = req.body.Configuration[i].TeCoeffVwsg;      
            // Guarda al configuracion
            sensor.Configuration.push(config);
        }*/

        //sensor = await sensor.save();

        req.body._id = new mongoose.Types.ObjectId(req.body._id);
        sensor = await VwsgPipe3.Sensor.create(req.body);

        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Stored 1 document\x1b[0m`);   
        res.send(sensor);
    } catch (error) {
        next(error);
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error storing document -> ${error.message }\x1b[0m`); 
    }
};

exports.indexData = async (req, res, next) => {
    
    var collectionName = VwsgPipe3.Data.collection.collectionName; 

    var logMessage = dayTime.getUtcString() + `\x1b[34mApi: ${req.method} (${req.originalUrl}) | Retrieve documents from ${collectionName}`;
    
    try { // Validacion
        validationHandler(req);
    }
    catch (err) {
        next(err);
        console.log(logMessage + "\x1b[31m -> " + err.message + "\x1b[0m");
        return;
    }

    console.log(logMessage + '\x1b[0m');

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
        }
        
        // Facet 2: Count
        var facet2Array = [{ $count: "Total" }];

        // Ejecuta la Query
        AggregationArray = [ stageCommon, { $facet: { Items: facet1Array, Count: facet2Array }}, { $project: { Items: 1, 'Info.Total': '$Count.Total'}}, { $unwind: '$Info.Total'}];
        const result = await VwsgPipe3.Data.aggregate(AggregationArray);
        
        // Completa la respuesta con datos calculados e informacion de paginacion
        var response = {};
        response.Items = {};
        response.Info = {};
        response.Info.From = null;
        response.Info.To = null;
        if(result.length == 0) { // No hubo respuesta
            response.Items = [];   
            response.Info.Retrieved = 0;
            response.Info.Total = 0;
        } else {
            response.Items =  await VwsgPipe3.AddCalculatedData(req.params.sensorId, result[0].Items);     
            if(result[0].Items.length) {
                response.Info.From = (req.query.skip !== undefined) ? Number(req.query.skip) + 1 : 1;
                response.Info.To = (req.query.limit !== undefined) ? response.Info.From + Number(req.query.limit) - 1 : result[0].Info.Total;
                if((response.Info.To !== null) && (response.Info.To > result[0].Info.Total))
                    response.Info.To = result[0].Info.Total;
            }
            response.Info.Retrieved = result[0].Items.length;
            response.Info.Total = result[0].Info.Total;
        }      
                
        // Envia la respuesta
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Retrieved ${response.Info.Retrieved} documents\x1b[0m`);   
        res.send(response);
    }

    catch (error)
    {
        next(error);
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error retrieving documents -> ${error.message }\x1b[0m`); 
    }
}

exports.showData = async (req, res, next) => {

    var collectionName = VwsgPipe3.Data.collection.collectionName;
    
    var logMessage = dayTime.getUtcString() + `\x1b[34mApi: ${req.method} (${req.originalUrl}) | Retrieve document from ${collectionName}`; 
    
    try { // Validacion
        validationHandler(req);
    }

    catch (err) {
        next(err);
        console.log(logMessage + "\x1b[31m -> " + err.message + "\x1b[0m");
        return;
    }

    console.log(logMessage + '\x1b[0m');
   
    try {
        // Obtiene el documento
        var result = await VwsgPipe3.Data.find( {_id: new mongoose.Types.ObjectId(req.params.dataId)}, {SensorId: 0, Type: 0, __v: 0} ).lean();
        // Envia la respuesta
        result =  await VwsgPipe3.AddCalculatedData(req.params.sensorId, result);     
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Retrieved ${result.length} document\x1b[0m`);   
        res.send((result.length > 0) ? result[0] : {});

    } catch (error) {
        next(error);
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${collectionName} | Error retrieving document -> ${error.message }\x1b[0m`); 
    }
};



