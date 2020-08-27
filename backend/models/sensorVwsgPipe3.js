const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const Schema = mongoose.Schema;

// Discriminador

const options = { discriminatorKey: 'Type' };

// CONFIGURACION SENSOR VWSG PIPE3

// Esquema base

const SensorVwsgPipe3ConfigSchema = new Schema({ 
    Date: { type: Date, default: Date.now() },
    InitFreqs: [Number],
    InitTemps: [Number] 
},
    options
);

// Esquema adicional para tipo Capbell Scientific Logger

const SensorVwsgPipe3ConfigCsLoggerSchema = new Schema({ 
        DataSourceFile: { type: String },
        DataSourceFreqCols: [Number],
        DataSourceTempCols: [Number]
});

// Esquema adicional para  tipo Azure IoT Device

const SensorVwsgPipe3ConfigIotAzureSchema = new Schema({ 
        
});

// Exporta los modelos de configuraciones

const SensorVwsgPipe3Config = mongoose.model('SensorVwsgPipe3Config', SensorVwsgPipe3ConfigSchema, 'SensorVwsgPipe3Config');
exports.SensorVwsgPipe3ConfigCsLogger = SensorVwsgPipe3Config.discriminator('CsLogger', SensorVwsgPipe3ConfigCsLoggerSchema, { _id: false });
exports.SensorVwsgPipe3ConfigIotAzure = SensorVwsgPipe3Config.discriminator('IotAzure', SensorVwsgPipe3ConfigIotAzureSchema, { _id: false });

// SENSOR VWSG PIPE3

const SensorVwsgPipe3Schema = new Schema({ 
        _id: { type: mongoose.Schema.Types.ObjectId },
        GatewayId: { type: mongoose.Schema.Types.ObjectId },
        configuration: [Schema.Types.Mixed] 
    });

exports.SensorVwsgPipe3 = mongoose.model('SensorVwsgPipe3', SensorVwsgPipe3Schema, 'SensorVwsgPipe3');
