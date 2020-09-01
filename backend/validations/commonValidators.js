const { body, param, query } = require('express-validator');

// Params

exports.paramGatewayIdIsMongoId = param("gwId")
    .isMongoId()
    .withMessage("Parameter 'Gateway Id' must be a valid hex-encoded representation of a MongoDB ObjectId");

exports.paramSensorIdIsMongoId = param("sensorId")
    .isMongoId()
    .withMessage("Parameter 'sensorId' must be a valid hex-encoded representation of a MongoDB ObjectId");

exports.paramDataIdIsMongoId = param("dataId")
    .isMongoId()
    .withMessage("Parameter 'dataId' must be a valid hex-encoded representation of a MongoDB ObjectId");

// Queries

exports.queryFromDateIsISO8601 = query("fromDate")
    .optional().isISO8601({ strict: true })
    .withMessage("Query parameter 'fromDate' must be a valid ISO 8601 datetime");

exports.queryToDateIsISO8601 = query("toDate")
    .optional().isISO8601({ strict: true })
    .withMessage("Query parameter 'toDate' must be a valid ISO 8601 datetime");

exports.querySkipIsInt = query("skip")
    .optional().isInt({ min: 0 })
    .withMessage("Query parameter 'skip' must be an integer value greater than or equal to zero");

exports.queryLimitIsInt = query("limit")
    .optional().isInt({ min: 1 })
    .withMessage("Query parameter 'limit' must be an integer value greater than zero");

exports.querySortCustom = query("sort")
    .custom((value, { req })  => {
        if(value !== undefined) {
            if((Number(value) === 1) || (Number(value) === -1))
                    return true;
                else 
                    throw new Error("Query parameter 'sort' must be a 1 or -1 value");
        } else {
            return true;
        }
    });








exports.bodyIsAggregationStageArray = body()
    .custom((value, { req })  => {
       if(Object.keys(req.body).length !== 0)
            if (req.body.constructor != [].constructor) 
                throw new Error("Body must contain an array of Mongo aggregation stages");
            else
                return true;
        else
            return true;
    });

exports.bodyUtcTimeIsISO8601 = body("UtcTime")
    .isISO8601({ strict: true })
    .withMessage("Body 'UtcTime' must be a valid ISO 8601 datetime");

exports.bodyPowerVoltageIsFloat = body("PowerVoltage")
    .optional().isFloat({ min: 0, max: 50 })
    .withMessage("Body 'PowerVoltage' must be a Float between 0 and 50");

exports.bodySensedVoltageIsFloat = body("SensedVoltage")
    .optional().isFloat({ min: 0, max: 50 })
    .withMessage("Body 'SensedVoltage' must be a Float between 0 and 50");

exports.bodyBatteryVoltageIsFloat = body("BatteryVoltage")
    .optional().isFloat({ min: 0, max: 5 })
    .withMessage("Body 'BatteryVoltage' must be a Float between 0 and 5");

exports.bodyTemperatureIsFloat = body("Temperature")
    .optional().isFloat({ min: -10, max: 60 })
    .withMessage("Body 'Temperature' must be a Float between -10 and 60");