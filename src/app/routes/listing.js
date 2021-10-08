const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const listingController = require('../controllers/listingController');
const tokenValidator = require('../middleware/tokenValidator');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const extArray = file.mimetype.split('/');
    let extension = extArray[extArray.length - 1];
    if (file.fieldname == 'raw') {
      extension = 'raw';
    }
    cb(null, `${file.fieldname}_${Date.now()}.${extension}`);
  },
});
const upload = multer({storage: storage});
const multi = upload.fields([
  {name: 'file', maxCount: 1},
  {name: 'raw', maxCount: 1},
]);

router.get('/listings',
    handlerException(tokenValidator),
    handlerException(listingController.index));
router.get('/listings/:id', handlerException(listingController.detail));
router.post('/listings',
    multi,
    handlerException(tokenValidator),
    handlerException(listingController.insert));

router.patch('/listings/:id/publish',
    handlerException(tokenValidator),
    handlerException(listingController.publish));

router.patch('/listings/:id',
    multi,
    handlerException(tokenValidator),
    handlerException(listingController.update));

router.post('/listings/:id/purchase',
    handlerException(tokenValidator),
    handlerException(listingController.purchase));

router.patch('/listings/:id/like',
    handlerException(tokenValidator),
    handlerException(listingController.like));

router.delete('/listings/:id',
    handlerException(tokenValidator),
    handlerException(listingController.remove));

router.get('/explore',
    handlerException(listingController.explore));

module.exports = router;
