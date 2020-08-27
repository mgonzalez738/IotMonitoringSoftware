const { body, param, query } = require('express-validator');

exports.queryFromIsISO8601 = query("from")
    .optional().isISO8601({ strict: true })
    .withMessage("Query parameter 'from' must be a valid ISO 8601 datetime");

exports.queryToIsISO8601 = query("to")
    .optional().isISO8601({ strict: true })
    .withMessage("Query parameter 'to' must be a valid ISO 8601 datetime");

exports.parameterGatewayIdIsMongoId = param("gwId")
    .isMongoId()
    .withMessage("Parameter 'Gateway Id' must be a valid hex-encoded representation of a MongoDB ObjectId");

exports.parameterDataIdIsMongoId = param("dataId")
    .isMongoId()
    .withMessage("Parameter 'Data Id' must be a valid hex-encoded representation of a MongoDB ObjectId");

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