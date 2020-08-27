const mongoose = require('mongoose');

const dayTime = require('../services/daytime')

//mongoose.set('useCreateIndex', true);

const Schema = mongoose.Schema;

// DISCRIMINADOR

const options = { discriminatorKey: 'Type' };

// ESQUEMA SENSOR VWSG PIPE3

// Esquema unico
const SensorVwsgPipe3Schema = new Schema({ 
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    GatewayId: { type: mongoose.Schema.Types.ObjectId, required: true },
    configuration: [Schema.Types.Mixed] 
});

exports.Sensor = mongoose.model('SensorVwsgPipe3', SensorVwsgPipe3Schema, 'SensorVwsgPipe3');

// CONFIGURACION SENSOR VWSG PIPE3

// Esquema base
const SensorVwsgPipe3ConfigSchema = new Schema({ 
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    Date: { type: Date, default: Date.now() },
    InitStrains: [Number],
    InitTemps: [Number] 
},
    options
);

// Esquema adicional para tipo Capbell Scientific Logger
const SensorVwsgPipe3ConfigCampbellSchema = new Schema({ 
        DataSourceFile: { type: String },
        DataSourceStrainCols: [Number],
        DataSourceTempCols: [Number]
});

// Esquema adicional para  tipo Azure IoT Device
const SensorVwsgPipe3ConfigAzureSchema = new Schema({ 
        
});

// Exporta los modelos de configuraciones
const ConfigModule = mongoose.model('SensorVwsgPipe3Config', SensorVwsgPipe3ConfigSchema, 'SensorVwsgPipe3Config');
exports.Config = mongoose.model('SensorVwsgPipe3Config', SensorVwsgPipe3ConfigSchema, 'SensorVwsgPipe3Config');
exports.ConfigCampbell = ConfigModule.discriminator('SensorVwsgPipe3ConfigCampbell', SensorVwsgPipe3ConfigCampbellSchema, process.env.DEVICE_DISC_CAMPBELL);
exports.ConfigAzure = ConfigModule.discriminator('SensorVwsgPipe3ConfigAzure', SensorVwsgPipe3ConfigAzureSchema, process.env.DEVICE_DISC_AZURE);

// DATOS SENSOR VWSG PIPE3

// Esquema base
const SensorVwsgPipe3DataSchema = new Schema({ 
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    SensorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    Date: { type: Date, default: Date.now() },
    Strains: [Number],
    Temps: [Number] 
},
    options
);

// Esquema adicional para tipo Capbell Scientific Logger
const SensorVwsgPipe3DataCampbellSchema = new Schema({ 
        
});

// Esquema adicional para  tipo Azure IoT Device
const SensorVwsgPipe3DataAzureSchema = new Schema({ 
        
});

// Exporta los modelos de datos
const SensorVwsgPipe3DataModule = mongoose.model('SensorVwsgPipe3Data', SensorVwsgPipe3DataSchema, 'SensorVwsgPipe3Data');
exports.Data = mongoose.model('SensorVwsgPipe3Data', SensorVwsgPipe3DataSchema, 'SensorVwsgPipe3Data');
exports.DataCampbell = SensorVwsgPipe3DataModule.discriminator('SensorVwsgPipe3DataCampbell', SensorVwsgPipe3DataCampbellSchema, process.env.DEVICE_DISC_CAMPBELL);
exports.DataAzure = SensorVwsgPipe3DataModule.discriminator('SensorVwsgPipe3DataAzure', SensorVwsgPipe3DataAzureSchema, process.env.DEVICE_DISC_AZURE);

// FUNCIONES

exports.GetSensorsWithLastConfigOnly = async (sensorType, sensorObjectId) => {    
    try {
        if((sensorType === undefined) || (sensorObjectId === undefined))
            throw new Error('Parameters could not be undefined. Use null values if are not required.')

        var aggregationArray = [];

        // Etapa : Match1 ObjectId
        var match1 = { $match : { $and: [ ] } };
        if(sensorObjectId != null)
        {
            match1.$match.$and.push({_id: new mongoose.Types.ObjectId(sensorObjectId)});
            aggregationArray.push(match1);
        }

        // Etapa : Set Obtiene el documento con solo el elemento mas nuevo del array de configuracion
        var set = { 
            $set: {
                'configuration': [{
                    $arrayElemAt: [ '$configuration', { $indexOfArray: [ '$configuration.Date', { $max:'$configuration.Date' } ] } ]
                }]
            }
        }
        aggregationArray.push(set);

        // Etapa : Match2 SensorType
        var match2 = { $match : { $and: [ ] } };
        if(sensorType != null)
        {
            match2.$match.$and.push({'configuration.Type': sensorType});
            aggregationArray.push(match2);
        }

        // Ejecuta la Query
        const sensors = await  SensorVwsgPipe3.aggregate(aggregationArray);
        return sensors;

    } catch (error) {
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: Error executing function GetLastConfiguration -> ${error}\x1b[0m`); 
    }
};