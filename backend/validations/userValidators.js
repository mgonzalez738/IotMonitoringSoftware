const { body } = require('express-validator');

// BODY

exports.bodyNameRequired = body("Name")
    .notEmpty()
    .withMessage("Body key 'Name' must be present and unique in collection");

exports.bodyEmailRequired = body("Email")
    .isEmail()
    .withMessage("Invalid email address");

exports.bodyPasswordFormat = body("Password")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/, "i")
    .withMessage("Password should be combination of one uppercase , one lower case, one digit and min 8 , max 20 char long");

exports.bodyCompanyIdIsMongoId = body("CompanyId")
    .isMongoId()
    .withMessage("Body key 'CompanyId' must be a valid hex-encoded representation of a MongoDB ObjectId");