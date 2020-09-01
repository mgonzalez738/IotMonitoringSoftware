const express = require('express');
const router = express.Router();

const {paramSensorIdIsMongoId, paramDataIdIsMongoId} = require('../validations/commonValidators');
const {queryFromDateIsISO8601, queryToDateIsISO8601, querySkipIsInt, queryLimitIsInt, querySortCustom} = require('../validations/commonValidators');

const SensorController = require('../controllers/sensorVwsgPipe3Controller');

// Gets

// Un dato de un sensor
router.get('/:sensorId/data/:dataId',
    [ paramSensorIdIsMongoId, paramDataIdIsMongoId ], 
    SensorController.showData
);

// Todos los datos de un sensor
router.get('/:sensorId/data',
    [ paramSensorIdIsMongoId, 
      queryFromDateIsISO8601, queryToDateIsISO8601, 
      querySkipIsInt, queryLimitIsInt, querySortCustom ], 
    SensorController.indexData
);

// Un sensor
router.get('/:sensorId',
    [ paramSensorIdIsMongoId ],
    SensorController.showSensor
);

// Todos los sensores
router.get('/',
    [ querySkipIsInt, queryLimitIsInt, querySortCustom ],
    SensorController.indexSensor
);

// Posts

// Nuevo sensor
router.post('/',
    [ ],
    SensorController.storeSensor
);



module.exports = router;