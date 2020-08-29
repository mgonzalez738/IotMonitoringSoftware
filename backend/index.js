require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const dayTime = require('./services/daytime')

const database = require('./database/mongo');
const iotHubEventConsumer = require('./consumers/iotHubEventConsumer');
const ftpServer = require('./consumers/ftpConsumer');

const gatewayRoutes = require('./routes/gatewayRoute');
const sensorVwsgPipe3Routes = require('./routes/sensorVwsgPipe3Routes');

const errorHandler = require("./middleware/errorHandler");

const listenPort = process.env.PORT;

// Inicia servicios

database.connect();
iotHubEventConsumer.suscribe();
ftpServer.start();

const mongoose = require('mongoose');
const VwsgPipe3Model = require("./models/sensorVwsgPipe3Model");

/*
let config1 = new VwsgPipe3Model.ConfigCampbell();
config1._id = mongoose.Types.ObjectId().toHexString();
config1.save();
let config2 = new VwsgPipe3Model.ConfigAzure();
config2._id = mongoose.Types.ObjectId().toHexString();
config2.save();


let sensor1 = new VwsgPipe3Model.Sensor()
sensor1._id = mongoose.Types.ObjectId().toHexString();
sensor1.GatewayId = mongoose.Types.ObjectId().toHexString();
sensor1.Configuration.push(config1);
sensor1.Configuration.push(config1);
sensor1 = sensor1.save();

let sensor2 = new VwsgPipe3Model.Sensor()
sensor2._id = mongoose.Types.ObjectId().toHexString();
sensor2.GatewayId = mongoose.Types.ObjectId().toHexString();
sensor2.Configuration.push(config2);
sensor2.Configuration.push(config2);
sensor2 = sensor2.save();
*/

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "import")));

app.get('/', function (req, res) {
  res.send('Hello from Gie IotMonitoring Api')
});

// Rutas Gateways
app.use("/api/gateways", gatewayRoutes);

// Rutas Sensores
app.use("/api/sensors/vwsgPipe3", sensorVwsgPipe3Routes);

app.use(errorHandler);



// Start Server
app.listen(listenPort, () => {
  console.log(dayTime.getUtcString() + "\x1b[34mApi: Start listening on port " + listenPort + "\x1b[0m");
})

