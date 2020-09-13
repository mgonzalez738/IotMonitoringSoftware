require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { loginUser } = require('./controllers/userController');
const { bodyEmailRequired } = require('./validations/commonValidators');
const dayTime = require('./services/daytime')

const database = require('./database/cosmos');
//const database = require('./database/mongo');
const iotHubEventConsumer = require('./consumers/iotHubEventConsumer');
const ftpServer = require('./consumers/ftpConsumer');

const userRoutes = require('./routes/userRoute');
const gatewayRoutes = require('./routes/gatewayRoute');
const sensorVwsgPipe3Routes = require('./routes/sensorVwsgPipe3Routes');
const { Authenticate } = require('./middleware/authorization');
const errorHandler = require("./middleware/errorHandler");

const listenPort = process.env.PORT;

// Inicia servicios

database.connect();
iotHubEventConsumer.suscribe();
ftpServer.start();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "import")));

app.get('/', function (req, res) {
  res.send('Hello from Gie IotMonitoring Api')
});

// Rutas 
app.post("/api/auth/users/login", bodyEmailRequired, loginUser); // Unica sin autenticacion
app.use("/api/auth/users", Authenticate, userRoutes);
app.use("/api/gateways", gatewayRoutes);
app.use("/api/sensors/vwsgPipe3", Authenticate, sensorVwsgPipe3Routes);

app.use(errorHandler);

// Start Server
app.listen(listenPort, () => {
  console.log(dayTime.getUtcString() + "\x1b[34mApi: Start listening on port " + listenPort + "\x1b[0m");
})

