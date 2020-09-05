const mongoose = require('mongoose');
const numeral = require('numeral');
const moment = require('moment');

const dayTime = require('../services/daytime')
const { TagsSchema } = require('../models/tagsModel');

const Schema = mongoose.Schema;

// DISCRIMINADOR DE TIPOS

const discriminator = { discriminatorKey: 'Type' };

// CONFIGURACION BASE SENSOR VWSG PIPE3

const ConfigSchema = new Schema({ 
    Date: { type: Date, default: Date.now() },
    InitStrains: { type: Array, default: [0.0, 0.0, 0.0] },
    InitTemps: { type: Array, default: [0.0, 0.0, 0.0] },
    TempSensorCount: { type: Number, default: 3 },
    TempCorrEnable: { type: Boolean, default: false },
    TempCorrFreeExpan: { type: Boolean, default: false },
    TempSensorsCount: { type: Number, default: 3 },
    TeCoeffPipe: { type: Number, default: 12.0 }, // uStrain/°C
    TeCoeffVwsg: { type: Number, default: 10.8 }, // uStrain/°C
},
    discriminator
);

// ESQUEMA SENSOR VWSG PIPE3

// Esquema base
const SensorSchema = new Schema({ 
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    Tags: TagsSchema,
    Configurations: [ConfigSchema] 
});
SensorSchema.index({"Tags.Name": 1}, {unique: true});

// Esquema adicional de configuracion para tipo Capbell Logger 
SensorSchema.path('Configurations').discriminator(process.env.DEVICE_DISC_CAMPBELL, new Schema({
    DataSourceFileName: { type: String, default: "" },
    DataSourceStrainCols: { type: Array, default: [null, null, null] },
    DataSourceTempCols: { type: Array, default: [null, null, null]  },
    DataSourceTimezone: { type: Number, default: 0 },
}, { _id: false }));

// Esquema adicional de configuracion para tipo Azure IoT
SensorSchema.path('Configurations').discriminator(process.env.DEVICE_DISC_AZURE, new Schema({

}, { _id: false }));

// Exporta el modelo de sensor
const Sensor = mongoose.model('SensorVwsgPipe3', SensorSchema, 'SensorVwsgPipe3');
exports.Sensor = Sensor;

// DATOS SENSOR VWSG PIPE3

// Esquema base
const DataSchema = new Schema({ 
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    SensorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    Date: { type: Date, index: { unique: true }},
    Strains: { type: Array, default: [] },
    Temps: { type: Array, default: [] }
},
    discriminator
);

// Esquema adicional para tipo Capbell Scientific Logger
const DataCampbellSchema = new Schema({ 
        
});

// Esquema adicional para  tipo Azure IoT Device
const DataAzureSchema = new Schema({ 
        
});

// Exporta los modelos de datos de sensor
const Data = mongoose.model('DataVwsgPipe3', DataSchema, 'DataVwsgPipe3');
Data.discriminator('DataVwsgPipe3Campbell', DataCampbellSchema, process.env.DEVICE_DISC_CAMPBELL);
Data.discriminator('DataVwsgPipe3Azure', DataAzureSchema, process.env.DEVICE_DISC_AZURE);
exports.Data = Data;

// FUNCIONES

const GetSensorConfig = async (sensorObjectId = undefined, lastOnly = false, sensorType = undefined) => {    
    try {
        var aggregationArray = [];

        // Etapa : Match1 Todos o solo un sensor
        var match1 = { $match : { } };
        if(sensorObjectId != null)
            match1 = { $match : {_id: new mongoose.Types.ObjectId(sensorObjectId)}};
        aggregationArray.push(match1);

        // Etapa : Project Devuelve solo el id de sensor y las configuraciones
        var project = { 
            $project: { 'Configurations': 1 }
        }
        aggregationArray.push(project);
        
        // Etapa : Set Obtiene el documento con solo el elemento mas nuevo del array de configuracion
        if(lastOnly)
        {
            var addFields = { 
                $addFields: {
                    'Configurations': [{
                        $arrayElemAt: [ '$Configurations', { $indexOfArray: [ '$Configurations.Date', { $max:'$Configurations.Date' } ] } ]
                    }]
                }
            }
            aggregationArray.push(addFields);
        }

        // Etapa : Ordena las configuraciones por fecha (Mas antigua primero)
        if(!lastOnly)
        {
            var sort1 =  { $unwind: "$Configurations" };
            var sort2 =  { $sort: { "Configurations.Date": 1 } };
            var sort3 =  { $group: { _id: "$_id", "Configurations": { "$push" : "$Configurations" } } };
            aggregationArray.push(sort1);
            aggregationArray.push(sort2);
            aggregationArray.push(sort3);
        }

        // Etapa : Match2 SensorType last configuration
        if(lastOnly)
        {
            var match2 = { $match : { $and: [ ] } };
            if(sensorType != null)
            {
                match2.$match.$and.push({'Configurations.Type': sensorType});
                aggregationArray.push(match2);
            }
        }

        // Ejecuta la Query
        const sensors = await Sensor.aggregate(aggregationArray);
        return sensors;

    } catch (error) {
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: Error executing function GetLastConfiguration -> ${error}\x1b[0m`); 
    }
};
exports.GetSensorConfig = GetSensorConfig;

const LoadFromParsedData = async (sensorType, fileName, parsedData) => {  
    
    if((sensorType === undefined) || (fileName === undefined) || (parsedData === undefined))
        throw new Error('Parameters could not be undefined.')

    if(sensorType == process.env.DEVICE_DISC_CAMPBELL)
    {
        try {
            // Obtiene los sensores VwsgPipe3 de loggers Campbell Scientific con solo la ultima configuracion
            var sensorsConf = await GetSensorConfig(null, true, process.env.DEVICE_DISC_CAMPBELL);
            
            // Verifica si coincide con la configuracion de alguno de los sensores
            for (i = 0; i < sensorsConf.length; i++) { 
                if(sensorsConf[i].Configurations[0].DataSourceFileName == fileName )
                { 
                    for(j = 0; j < parsedData.length; j++)
                    {
                        // Carga los dados del sensor y guarda
                        let data = new Data();
                        data._id = mongoose.Types.ObjectId().toHexString();
                        data.Type = process.env.DEVICE_DISC_CAMPBELL;
                        data.SensorId = sensorsConf[i]._id;
                        data.Date = moment(parsedData[j][0]+numeral(sensorsConf[i].Configurations[0].DataSourceTimezone).format('+00'), moment.ISO_8601)
                        data.Strains.push(parsedData[j][sensorsConf[i].Configurations[0].DataSourceStrainCols[0]]);
                        data.Strains.push(parsedData[j][sensorsConf[i].Configurations[0].DataSourceStrainCols[1]]);
                        data.Strains.push(parsedData[j][sensorsConf[i].Configurations[0].DataSourceStrainCols[2]]);
                        data.Temps.push(parsedData[j][sensorsConf[i].Configurations[0].DataSourceTempCols[0]]);
                        data.Temps.push(parsedData[j][sensorsConf[i].Configurations[0].DataSourceTempCols[1]]);
                        data.Temps.push(parsedData[j][sensorsConf[i].Configurations[0].DataSourceTempCols[2]]);
                        await data.save();
                    }
                    console.log(dayTime.getUtcString() + `\x1b[35mDatabase: ${Data.collection.collectionName} | Inserted ${parsedData.length} documents\x1b[0m`); 
        
                }
            }
        } catch (error) {
            console.log(dayTime.getUtcString() + `\x1b[35mDatabase: Error loading data from ${process.env.DEVICE_DISC_CAMPBELL} parsed file -> ${error}\x1b[0m`); 
        }
    }
}
exports.LoadFromParsedData = LoadFromParsedData;

const AddCalculatedData = async (sensorId, sensorData) => {

    // Obtiene las configuraciones del sendor
    var sensorConfigs = await GetSensorConfig(sensorId);

    // Agrega los datos calculados a cada documento
    for(i=0; i<sensorData.length; i++) {

        // Obtiene la configuracion a aplicar segun la fecha de los datos
        confIndex = -1;
        for(j=0; j<sensorConfigs[0].Configurations.length; j++)
        {
            if(sensorData[i].Date > sensorConfigs[0].Configurations[j].Date)
                confIndex = j;
            else
                break;
        }
        if(confIndex == -1)
        {
            // No pudo encontrar una configuracion anterior a la fecha de los datos
            sensorData[i].StrainsDelta = [NaN, NaN, NaN];   
            sensorData[i].StrainAxial = NaN;  
            sensorData[i].StrainBending = NaN;    
            sensorData[i].AngleBending = NaN;   
            sensorData[i].Error = "Could not find a valid configuration for calculations. Check data and sensor configurations dates."
        }
        else
        {
            sensorData[i].StrainsDelta = CalcRelativeStrains(sensorConfigs[0].Configurations[confIndex], sensorData[i]);
            sensorData[i].StrainAxial = CalcAxialStrain(sensorData[i].StrainsDelta);
            sensorData[i].StrainBending = CalcBendingStrain(sensorData[i].StrainsDelta);  
            sensorData[i].AngleBending = CalcBendingAngle(sensorData[i].StrainsDelta);
        }
        
    }
    return sensorData;
}
exports.AddCalculatedData = AddCalculatedData;

const CalcRelativeStrains = (conf, data) => {
    strains = [];

    // Sin corrección de temperaura
    if(!conf.TempCorrEnable) {
        strains[0] = data.Strains[0] - conf.InitStrains[0];
        strains[1] = data.Strains[1] - conf.InitStrains[1];
        strains[2] = data.Strains[2] - conf.InitStrains[2];
    }

    // Con corrección de temperaura
    else {   
        var deltaTemp0, deltaTemp1, deltaTemp2;

        // Cantidad de sensores de temperatura
        deltaTemp0 = data.Temps[0] - conf.InitTemps[0];
        if(conf.TempSensorCount == 1) {
            deltaTemp1 = data.Temps[0] - conf.InitTemps[0];
            deltaTemp2 = data.Temps[0] - conf.InitTemps[0];
        } else if (conf.TempSensorCount == 3) {
            deltaTemp1 = data.Temps[1] - conf.InitTemps[1];
            deltaTemp2 = data.Temps[2] - conf.InitTemps[2];
        }

        // Con restriccion a la expansion axial de la tuberia
        if(!conf.TempCorrFreeExpan)
        {
            strains[0] = data.Strains[0] - conf.InitStrains[0] + conf.TeCoeffVwsg * deltaTemp0;
            strains[1] = data.Strains[1] - conf.InitStrains[1] + conf.TeCoeffVwsg * deltaTemp1;
            strains[2] = data.Strains[2] - conf.InitStrains[2] + conf.TeCoeffVwsg * deltaTemp2;
        }
        // Sin restriccion a la expansion axial de la tuberia
        else if(!conf.TempCorrFreeExpan)
        {
            strains[0] = data.Strains[0] - conf.InitStrains[0] + (conf.TeCoeffVwsg - conf.TeCoeffPipe) * deltaTemp0;
            strains[1] = data.Strains[1] - conf.InitStrains[1] + (conf.TeCoeffVwsg - conf.TeCoeffPipe) * deltaTemp1;
            strains[2] = data.Strains[2] - conf.InitStrains[2] + (conf.TeCoeffVwsg - conf.TeCoeffPipe) * deltaTemp2;
        }
    }
    return strains
}

const CalcAxialStrain = (strains) => {
    strain = (strains[0] + strains[1] + strains[2]) / 3;
    return strain;
}

const CalcBendingStrain = (strains) => {
    strain = 2 / 3 *Math.sqrt( Math.pow(strains[0],2) + Math.pow(strains[1],2) + Math.pow(strains[2],2) 
                               - strains[0]*strains[1] - strains[0]*strains[2] - strains[1]*strains[2]);
    return strain;
}

const CalcBendingAngle = (strains) => {
    angle = Math.atan(Math.sqrt(3) * (strains[1] - strains[2]) / (2 * strains[0] - strains[1] - strains[2])) * 180 / Math.PI + 180;
    return angle;
}
