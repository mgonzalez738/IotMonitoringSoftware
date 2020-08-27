require('dotenv').config();

const listenPort = process.env.PORT;

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorHandler = require("./middleware/errorHandler");
const gatewayRoutes = require('./routes/gatewayRoute');

const iotHubEventConsumer = require('./consumers/iotHubEventConsumer');

const ftpServer = require('./consumers/ftpConsumer');

const dayTime = require('./services/daytime')


mongoose.connect('mongodb://localhost/IotMonitoring', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(() => console.log('Connection to local MongoDB successful')).catch(err => {
    console.log(`DB Connection Error: ${err.message}`);
});
/*
mongoose.connect("mongodb://"+process.env.COSMO_DB_HOST+":"+process.env.COSMO_DB_PORT+"/"+process.env.COSMO_DB_NAME+"?ssl=true&replicaSet=globaldb", {
  auth: {
    user: process.env.COSMO_DB_USER,
    password: process.env.COSMO_DB_PASSWORD
  },
useNewUrlParser: true,
useUnifiedTopology: true,
retryWrites: false
})
.then(() => console.log('Connection to CosmosDB successful'))
.catch((err) => console.error(err));
*/

const { SensorVwsgPipe3, SensorVwsgPipe3ConfigCsLogger, SensorVwsgPipe3ConfigIotAzure } = require("./models/sensorVwsgPipe3");

let config1 = new SensorVwsgPipe3ConfigCsLogger();
let config2 = new SensorVwsgPipe3ConfigIotAzure();

config1.save();
config2.save();

let sensor1 = new SensorVwsgPipe3();
sensor1._id = mongoose.Types.ObjectId().toHexString();
sensor1.configuration.push(config1);
sensor1 = sensor1.save();


let sensor2 = new SensorVwsgPipe3();
sensor2._id = mongoose.Types.ObjectId().toHexString();
sensor2.configuration.push(config2);
sensor2 = sensor2.save();


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "import")));

app.get('/', function (req, res) {
  res.send('Hello from Gie IotMonitoring Api')
});

app.use("/api/gateways", gatewayRoutes);

app.use(errorHandler);

iotHubEventConsumer.suscribe();

ftpServer.start();

// Start Server
app.listen(listenPort, () => {
  console.log(dayTime.getUtcString() + "\x1b[34mApi: Start listening on port " + listenPort + "\x1b[0m");
})

