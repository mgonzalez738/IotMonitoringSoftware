const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');
const { Authorize } = require('../middleware/authorization');
const { bodyNameRequired, bodyEmailRequired, bodyPasswordFormat, bodyCompanyIdIsMongoId } = require('../validations/userValidators');

// GETS

router.get('/me',
    [ Authorize('super', 'administrator', 'user', 'guest') ],
    UserController.getMe
);

router.get('/:userId',
    [ Authorize('super', 'administrator') ],
    //UserController.showUser
);

router.get('/',
    [ Authorize('super', 'administrator') ],
    UserController.indexUser
);

// POST

router.post('/',
    [ 
        Authorize('super', 'administrator'),
        bodyNameRequired, bodyEmailRequired, bodyPasswordFormat, bodyCompanyIdIsMongoId
    ],
    UserController.storeUser
);

// PUT

router.put('/:userId',
    [ Authorize('super', 'administrator') ],
    //UserController.updateUser
);

// DELETE

router.delete('/:userId',
    [ Authorize('super', 'administrator') ],
    //UserController.deleteUser
);

module.exports = router;