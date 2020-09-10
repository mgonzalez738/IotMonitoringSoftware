var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;

// Cadena de conexion al IoT Hub
var iotHubConnectionString = "HostName=" + process.env.IOT_HUB_HOST + ";" +
                             "SharedAccessKeyName=" + process.env.IOT_HUB_SHARED_ACCESS_KEY_NAME + ";" +
                             "SharedAccessKey=" + process.env.IOT_HUB_SHARED_ACCESS_KEY;

var registry = Registry.fromConnectionString("HostName=MonitoringHub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=aOFsWnGlHYPBUyO+J4QJtrq7zXITgnxlHuOewLiyTpU=");                           
var client = Client.fromConnectionString(iotHubConnectionString);

exports.CreateDevice = async (id, isEdge) => {
    
    var deviceInfo = {
        deviceId: id,
        status: 'enabled',
        capabilities: { iotEdge: isEdge }
    };

    const result = await registry.create(deviceInfo);
    return "HostName=" + process.env.IOT_HUB_HOST + ";" +
           "DeviceId=" + result.responseBody.deviceId + ";" +
           "SharedAccessKey=" + result.responseBody.authentication.symmetricKey.primaryKey;
}

exports.DeleteDevice = async (id) => {
    
    const result = await registry.delete(id);
    return result;
}