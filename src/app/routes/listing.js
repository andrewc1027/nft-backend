const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const listingController = require('../controllers/listingController');
const tokenValidator = require('../middleware/tokenValidator');
const superAdmin = require('../middleware/superAdmin');
const tokenOption = require('../middleware/tokenOption');
const multer = require('multer');
const invitee = require('../middleware/invitee');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const extArray = file.mimetype.split('/');
        let extension = extArray[extArray.length - 1];
        cb(null, `${file.fieldname}_${Date.now()}.${extension}`);
    },
});
const upload = multer({
    storage: storage,
    limits: {fileSize: 80000000},
});
const multi = upload.fields([
    {name: 'file', maxCount: 20},
    {name: 'thumbnail', maxCount: 1},
]);

router.get('/listings',
    handlerException(tokenValidator),
    handlerException(listingController.index));
router.get('/listings/:id',
    handlerException(tokenOption),
    handlerException(listingController.detail));
router.get('/listings/user/:username',
    handlerException(listingController.getListingsByUsername));
router.get('/listings/user/:username/sold',
    handlerException(listingController.getSoldListingsByUsername));
router.post('/listings',
    multi,
    handlerException(tokenValidator),
    handlerException(invitee),
    handlerException(listingController.insert));

router.patch('/listings/:id/publish',
    handlerException(tokenValidator),
    handlerException(listingController.publish));

router.patch('/listings/:id/depublish',
    handlerException(tokenValidator),
    handlerException(listingController.depublish));

router.patch('/listings/:id',
    multi,
    handlerException(tokenValidator),
    handlerException(listingController.update));

router.post('/listings/:id/purchase',
    handlerException(tokenValidator),
    handlerException(listingController.purchase));

router.patch('/listings/:id/like',
    handlerException(tokenOption),
    handlerException(listingController.like));

router.delete('/listings/:id',
    handlerException(tokenValidator),
    handlerException(listingController.remove));

router.get('/explore',
    handlerException(listingController.explore));

router.get('/markers',
    handlerException(listingController.getMarkers));

router.get('/tags',
    handlerException(listingController.getTags));

router.post('/listings/:id/auction',
    handlerException(tokenValidator),
    handlerException(listingController.finishAuction));

router.get('/listings/:id/download',
    handlerException(tokenValidator),
    handlerException(listingController.download));

router.get('/indexer',
    // handlerException(superAdmin),
    handlerException(listingController.indexer));
module.exports = router;
