const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../../exceptions/handler');
const trxController = require('../../controllers/admin/trxController');
const admin = require('../../middleware/admin');

/**
 * These Routes are for admin page
 */
router.get('/admin/transactions',
    handlerException(admin),
    handlerException(trxController.getTransactions));

module.exports = router;
