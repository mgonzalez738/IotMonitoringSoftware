const log4js = require('log4js');
const mongoAppender = require('log4js-node-mongodb');

log4js.addAppender(
    mongoAppender.appender({connectionString: "mongodb://iotmonitoring:z9BrDHIGImC3AjnhZnSkZed5qCxmiOW5wBlXzBL5noOdmPj4E76MJ4udGRHomuifK2sT97kw07AIbn8UkcSiPQ==@iotmonitoring.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&appName=@iotmonitoring@" }),
    'logs'
);

var logger = log4js.getLogger('logs');
exports.Logger = logger;
