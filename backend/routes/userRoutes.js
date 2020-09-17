const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');
const { Authorize } = require('../middleware/authorization');
const { bodyFirstNameRequired, bodyLastNameRequired, bodyEmailRequired, bodyPasswordRequired, bodyCompanyIdOptional, queryEmailValid } = require('../validations/userValidators');
const { bodyEmailOptional, bodyPasswordOptional } = require('../validations/userValidators');
const { paramUserIdIsMongoId, querySkipIsInt, queryLimitIsInt } = require('../validations/commonValidators');

// GETS

router.get('/me',
    [ Authorize('super', 'administrator', 'user', 'guest') ],
    UserController.getMe
);

router.get('/:userId',
    [ 
        Authorize('super', 'administrator'),
        paramUserIdIsMongoId
    ],
    UserController.showUser   
);

router.get('/',
    [ 
        Authorize('super', 'administrator'),
        querySkipIsInt, queryLimitIsInt, queryEmailValid
    ],
    UserController.indexUser
);

// POST

router.post('/',
    [ 
        Authorize('super', 'administrator'),
        bodyFirstNameRequired, bodyLastNameRequired, bodyEmailRequired,
        bodyPasswordRequired, bodyCompanyIdOptional
    ],
    UserController.storeUser
);

// PUT

router.put('/:userId',
    [ 
        Authorize('super', 'administrator'),
        paramUserIdIsMongoId, bodyEmailOptional,
        bodyPasswordOptional, bodyCompanyIdOptional
    ],
    UserController.updateUser
);

// DELETE

router.delete('/:userId',
    [ 
        Authorize('super', 'administrator'),
        paramUserIdIsMongoId
    ],
    UserController.deleteUser
);

module.exports = router;