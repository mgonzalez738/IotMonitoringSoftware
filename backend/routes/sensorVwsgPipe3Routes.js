const express = require('express');
const router = express.Router();

const SensorController = require('../controllers/sensorVwsgPipe3Controller');

// Gets

// Un dato de un sensor
router.get('/:sensorId/data/:dataId',
    [ ], 
    //funcion
);

// Todos los datos de un sensor
router.get('/:sensorId/data',
    [ ], 
    SensorController.indexData
);

// Un sensor
router.get('/:sensorId',
    [ ],
    //funcion
);

// Todos los sensores
router.get('/',
    [ ],
    SensorController.indexSensor
);

module.exports = router;