const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const listingController = require('../controllers/listingController');

router.get('/listings', handlerException(listingController.index));
router.get('/listing/:id', handlerException(listingController.detail));

module.exports = router;
