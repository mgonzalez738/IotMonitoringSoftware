const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');

// GETS

router.get('/:userId',
    [ ],
    //UserController.showUser
);

router.get('/',
    [ ],
    //UserController.indexUser
);

// POST

router.post('/login',
    [ ],
    UserController.loginUser
);

router.post('/',
    [ ],
    UserController.storeUser
);

// PUT

router.put('/:userId',
    [ ],
    //UserController.updateUser
);

// DELETE

router.delete('/:userId',
    [ ],
    //UserController.deleteUser
);

module.exports = router;