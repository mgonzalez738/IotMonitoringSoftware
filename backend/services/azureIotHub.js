var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;

const dayTime = require('../services/daytime');

// Cadena de conexion al IoT Hub
var iotHubConnectionString = "HostName=" + process.env.IOT_HUB_HOST + ";" +
                             "SharedAccessKeyName=" + process.env.IOT_HUB_SHARED_ACCESS_KEY_NAME + ";" +
                             "SharedAccessKey=" + process.env.IOT_HUB_SHARED_ACCESS_KEY;
const iotHubName = process.env.IOT_HUB_HOST.slice(0, process.env.IOT_HUB_HOST.indexOf("."));
var registry = Registry.fromConnectionString("HostName=MonitoringHub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=aOFsWnGlHYPBUyO+J4QJtrq7zXITgnxlHuOewLiyTpU=");                           
var client = Client.fromConnectionString(iotHubConnectionString);

exports.CreateDevice = async (id, isEdge) => {
    
    var deviceInfo = {
        deviceId: id,
        status: 'enabled',
        capabilities: { iotEdge: isEdge }
    };

    try {
        const result = await registry.create(deviceInfo);
        console.log(dayTime.getUtcString() + `\x1b[33mAzureIot: ${iotHubName} | Device ${result.responseBody.deviceId} created\x1b[0m`); 
        //console.log(result);
        return "HostName=" + process.env.IOT_HUB_HOST + ";" +
               "DeviceId=" + result.responseBody.deviceId + ";" +
               "SharedAccessKey=" + result.responseBody.authentication.symmetricKey.primaryKey;
    } catch (error) {
        console.log(dayTime.getUtcString() + `\x1b[33mAzureIot: ${iotHubName} | Error creating device -> ${error.message}\x1b[0m`); 
        return "";
    }
}
    



