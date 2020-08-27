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
const errorHandler = require("./middleware/errorHandler");

const listenPort = process.env.PORT;

// Inicia servicios

database.connect();
iotHubEventConsumer.suscribe();
ftpServer.start();

const mongoose = require('mongoose');
const { SensorVwsgPipe3Config, SensorVwsgPipe3ConfigCampbell, SensorVwsgPipe3ConfigAzure } = require("./models/sensorVwsgPipe3Model");

/*
let config1 = new SensorVwsgPipe3ConfigCampbell();
config1._id = mongoose.Types.ObjectId().toHexString();
config1.save();
let config2 = new SensorVwsgPipe3ConfigAzure();
config2._id = mongoose.Types.ObjectId().toHexString();
config2.save();
*/
/*
let sensor1 = new SensorVwsgPipe3();
sensor1._id = mongoose.Types.ObjectId().toHexString();
sensor1.GatewayId = mongoose.Types.ObjectId().toHexString();
sensor1.configuration.push(config1);
sensor1.configuration.push(config1);
sensor1 = sensor1.save();

let sensor2 = new SensorVwsgPipe3();
sensor2._id = mongoose.Types.ObjectId().toHexString();
sensor2.GatewayId = mongoose.Types.ObjectId().toHexString();
sensor2.configuration.push(config2);
sensor2.configuration.push(config2);
sensor2 = sensor2.save();
*/




const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "import")));

app.get('/', function (req, res) {
  res.send('Hello from Gie IotMonitoring Api')
});

app.use("/api/gateways", gatewayRoutes);

app.use(errorHandler);



// Start Server
app.listen(listenPort, () => {
  console.log(dayTime.getUtcString() + "\x1b[34mApi: Start listening on port " + listenPort + "\x1b[0m");
})

