const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const listingController = require('../controllers/listingController');
const tokenValidator = require('../middleware/tokenValidator');

router.get('/listings', handlerException(listingController.index));
router.get('/listing/:id', handlerException(listingController.detail));
router.post('/listing/:id/purchase',
    handlerException(tokenValidator),
    handlerException(listingController.purchase));

router.patch('/listing/:id/like',
    handlerException(tokenValidator),
    handlerException(listingController.like));
module.exports = router;
