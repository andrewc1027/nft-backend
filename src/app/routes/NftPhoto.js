const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const NftController = require('../controllers/nftPhotoController');
const multer = require('multer');
const tokenValidator = require('../middleware/tokenValidator');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const extArray = file.mimetype.split('/');
    const extension = extArray[extArray.length - 1];
    cb(null, `${file.fieldname}_${Date.now()}.${extension}`);
  },
});
const upload = multer({storage: storage});
const multi = upload.fields([
  {name: 'photo', maxCount: 1},
  {name: 'raw', maxCount: 1},
]);

router.get('/photos',
    handlerException(tokenValidator),
    handlerException(NftController.index));

router.get('/photo/:id',
    handlerException(tokenValidator),
    handlerException(NftController.getOne));

router.post('/photo',
    multi,
    handlerException(tokenValidator),
    handlerException(NftController.insert));

router.patch('/photo/:id',
    handlerException(tokenValidator),
    handlerException(NftController.update));

router.delete('/photo/:id',
    handlerException(tokenValidator),
    handlerException(NftController.remove));

router.post('/photo/:id/publish',
    handlerException(tokenValidator),
    handlerException(NftController.publish));

module.exports = router;
