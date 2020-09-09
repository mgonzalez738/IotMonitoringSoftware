const express = require('express');
const router = express.Router();

const {paramSensorIdIsMongoId, paramDataIdIsMongoId} = require('../validations/commonValidators');
const {queryFromDateIsISO8601, queryToDateIsISO8601, querySkipIsInt, queryLimitIsInt, querySortCustom, bodyNameRequired } = require('../validations/commonValidators');
const {bodyConfigurationCustom} = require('../validations/sensorVwsgPipe3Validators');

const SensorController = require('../controllers/sensorVwsgPipe3Controller');

// GETS

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

// POSTS

// Un sensor
router.post('/',
    [ bodyNameRequired, bodyConfigurationCustom ],
    SensorController.storeSensor
);

// Un dato de un sensor
router.post('/:sensorId/data/',
    [ paramSensorIdIsMongoId ], // Date required, validar data
    SensorController.storeData
);

// PUTS

// Un sensor
router.put('/:sensorId',
    [ paramSensorIdIsMongoId ],
    SensorController.updateSensor
);

// Un dato de un sensor
router.put('/:sensorId/data/:dataId',
    [ paramSensorIdIsMongoId, paramDataIdIsMongoId ],
    SensorController.updateSensor
);

// DELETES

// Un sensor
router.delete('/:sensorId',
    [ paramSensorIdIsMongoId ],
    SensorController.deleteSensor
);

/// Un dato de un sensor
router.delete('/:sensorId/data/:dataId',
    [ paramSensorIdIsMongoId, paramDataIdIsMongoId ],
    SensorController.deleteSensor
);

module.exports = router;