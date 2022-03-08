const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../../exceptions/handler');
const usrController = require('../../controllers/admin/userController');
const admin = require('../../middleware/admin');

/**
 * These Routes are for admin page
 */
router.get('/admin/users',
    handlerException(admin),
    handlerException(usrController.getAllUsers));

router.get('/admin/users/:id',
    handlerException(admin),
    handlerException(usrController.getUserById));

router.patch('/admin/users/:id',
    handlerException(admin),
    handlerException(usrController.updateUser));

module.exports = router;
