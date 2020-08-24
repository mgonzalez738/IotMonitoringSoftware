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
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get('/', function (req, res) {
  res.send('Hello from Gie IotMonitoring Api')
});

app.use("/api/gateways", gatewayRoutes);

app.use(errorHandler);

iotHubEventConsumer.suscribe();

// Start Server
app.listen(listenPort, () => {
    console.log("IoT Server iniciado (Puerto " + listenPort + ").");
})