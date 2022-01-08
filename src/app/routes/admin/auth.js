const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../../exceptions/handler');
const authController = require('../../controllers/admin/auth');
const superAdmin = require('../../middleware/superAdmin');

/**
 * These Routes are for admin page
 */
router.post('/admin/login',
    handlerException(authController.login));

router.post('/admin/register',
    handlerException(superAdmin),
    handlerException(authController.register));

module.exports = router;
