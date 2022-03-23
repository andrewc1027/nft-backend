const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../../exceptions/handler');
const listingController = require('../../controllers/admin/listingController');
const admin = require('../../middleware/admin');

/**
 * These Routes are for admin page
 */
router.get('/admin/listings',
    handlerException(admin),
    handlerException(listingController.getListings));
router.get('/admin/listings/:id/download',
    handlerException(admin),
    handlerException(listingController.download));

module.exports = router;
