const mongoose = require('mongoose');

const dayTime = require('../services/daytime')

const Schema = mongoose.Schema;

// DISCRIMINADOR

const options = { discriminatorKey: 'Type' };

// ESQUEMA SENSOR VWSG PIPE3

// Esquema unico
const SensorSchema = new Schema({ 
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    GatewayId: { type: mongoose.Schema.Types.ObjectId, required: true },
    Configuration: [Schema.Types.Mixed] 
});

const SensorModule = mongoose.model('SensorVwsgPipe3', SensorSchema, 'SensorVwsgPipe3');
exports.Sensor = mongoose.model('SensorVwsgPipe3', SensorSchema, 'SensorVwsgPipe3');

// CONFIGURACION SENSOR VWSG PIPE3

// Esquema base
const ConfigSchema = new Schema({ 
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    Date: { type: Date, default: Date.now() },
    Timezone: { type: Number },
    InitStrains: [Number],
    InitTemps: [Number] 
},
    options
);

// Esquema adicional para tipo Capbell Scientific Logger
const ConfigCampbellSchema = new Schema({ 
        DataSourceFile: { type: String },
        DataSourceStrainCols: [Number],
        DataSourceTempCols: [Number]
});

// Esquema adicional para  tipo Azure IoT Device
const ConfigAzureSchema = new Schema({ 
        
});

// Exporta los modelos de configuraciones
const ConfigModule = mongoose.model('ConfigVwsgPipe3', ConfigSchema, 'ConfigVwsgPipe3');
exports.Config = mongoose.model('ConfigVwsgPipe3', ConfigSchema, 'ConfigVwsgPipe3');
exports.ConfigCampbell = ConfigModule.discriminator('ConfigVwsgPipe3Campbell', ConfigCampbellSchema, process.env.DEVICE_DISC_CAMPBELL);
exports.ConfigAzure = ConfigModule.discriminator('ConfigVwsgPipe3Azure', ConfigAzureSchema, process.env.DEVICE_DISC_AZURE);

// DATOS SENSOR VWSG PIPE3

// Esquema base
const DataSchema = new Schema({ 
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    SensorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    Date: { type: Date, default: Date.now() },
    Strains: [Number],
    Temps: [Number] 
},
    options
);

// Esquema adicional para tipo Capbell Scientific Logger
const DataCampbellSchema = new Schema({ 
        
});

// Esquema adicional para  tipo Azure IoT Device
const DataAzureSchema = new Schema({ 
        
});

// Exporta los modelos de datos
const DataModule = mongoose.model('DataVwsgPipe3', DataSchema, 'DataVwsgPipe3');
exports.Data = mongoose.model('DataVwsgPipe3', DataSchema, 'DataVwsgPipe3');
exports.DataCampbell = DataModule.discriminator('DataVwsgPipe3Campbell', DataCampbellSchema, process.env.DEVICE_DISC_CAMPBELL);
exports.DataAzure = DataModule.discriminator('DataVwsgPipe3Azure', DataAzureSchema, process.env.DEVICE_DISC_AZURE);

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
                'Configuration': [{
                    $arrayElemAt: [ '$Configuration', { $indexOfArray: [ '$Configuration.Date', { $max:'$Configuration.Date' } ] } ]
                }]
            }
        }
        aggregationArray.push(set);

        // Etapa : Match2 SensorType
        var match2 = { $match : { $and: [ ] } };
        if(sensorType != null)
        {
            match2.$match.$and.push({'Configuration.Type': sensorType});
            aggregationArray.push(match2);
        }

        // Ejecuta la Query
        const sensors = await  SensorModule.aggregate(aggregationArray);
        return sensors;

    } catch (error) {
        console.log(dayTime.getUtcString() + `\x1b[35mDatabase: Error executing function GetLastConfiguration -> ${error}\x1b[0m`); 
    }
};
