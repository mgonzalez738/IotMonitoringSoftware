require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const { Levels, Logger } = require('./services/loggerService');

const { loginUser, forgotPassword, resetPassword } = require('./controllers/userController');
const { bodyUserIdRequired, bodyPasswordRequired } = require('./validations/userValidators');

const { DbName, DbConnectionString, DbConnectionOptions} = require('./database/cosmos');

const iotHubEventConsumer = require('./consumers/iotHubEventConsumer');
const ftpServer = require('./consumers/ftpConsumer');

const clientRoutes = require('./routes/clientRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const gatewayRoutes = require('./routes/gatewayRoute');
const sensorVwsgPipe3Routes = require('./routes/sensorVwsgPipe3Routes');
const { Authenticate } = require('./middleware/authorization');
const errorHandler = require("./middleware/errorHandler");

const listenPort = process.env.PORT;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "import")));

app.get('/', function (req, res) {
  res.send('Hello from Gie IotMonitoring Api')
});

// Rutas 
app.post("/api/auth/users/login", [ bodyUserIdRequired ], loginUser); // sin autenticacion
app.post("/api/auth/users/forgotpassword", [ bodyUserIdRequired ], forgotPassword); // sin autenticacion
app.put("/api/auth/users/resetpassword/:resetToken", [ bodyUserIdRequired, bodyPasswordRequired], resetPassword); // sin autenticacion
app.use("/api/clients", Authenticate, clientRoutes);
app.use("/api/auth/users", Authenticate, userRoutes);
app.use("/api/auth/companies", Authenticate, companyRoutes);
app.use("/api/gateways", gatewayRoutes);
app.use("/api/sensors/vwsgPipe3", Authenticate, sensorVwsgPipe3Routes);

app.use(errorHandler);

// Espera la conexion a la base de datos para arrancar la app

app.on('dbReady', function() { 
  app.listen(listenPort, () => {
    Logger.Save(Levels.Info, 'Api',"Start listening on port " + listenPort); 
    iotHubEventConsumer.suscribe();
    ftpServer.start();
  }); 
}); 

// Conecta a la base de datos
mongoose.connect(DbConnectionString, DbConnectionOptions)
  .then( async () => {
    // Avisa al logger que la DB esta conectada
    //await Logger.SetDbConnected(true);
    Logger.Save(Levels.Info, 'Backend',`Application startded`); 
    Logger.Save(Levels.Info, 'Database',`${DbName} connected`); 
    Logger.Save(Levels.Info, 'Logger',`Level set to ${Logger.GetLevel().Text}`); 
    app.emit('dbReady');
  })
  .catch(err => { 
    Logger.Save(Levels.Info, 'Backend',`Application startded`); 
    Logger.Save(Levels.Fatal, 'Database',`Error connecting to ${DbName} -> ${err.message}`);
  });









