const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const collectionController = require('../controllers/collectionController');
const tokenValidator = require('../middleware/tokenValidator');
const multer = require('multer');
const s3 = require('../config/s3');
const multerS3 = require('multer-s3');

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function(req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function(req, file, cb) {
      const extArray = file.mimetype.split('/');
      const extension = extArray[extArray.length - 1];
      cb(null, `${file.fieldname}_${Date.now()}.${extension}`);
    },
  }),
});

const multi = upload.fields([
  {name: 'logoImage', maxCount: 1},
  {name: 'bannerImage', maxCount: 1},
  {name: 'featureImage', maxCount: 1},
]);
router.get('/collections',
    handlerException(tokenValidator),
    handlerException(collectionController.index));

router.get('/collections/:id',
    handlerException(tokenValidator),
    handlerException(collectionController.getOne));

router.post('/collections',
    multi,
    handlerException(tokenValidator),
    handlerException(collectionController.insert));

router.patch('/collections/:id',
    multi,
    handlerException(tokenValidator),
    handlerException(collectionController.update));

router.delete('/collections/:id',
    handlerException(tokenValidator),
    handlerException(collectionController.remove));

module.exports = router;
