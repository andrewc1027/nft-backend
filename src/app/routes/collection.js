const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const collectionController = require('../controllers/collectionController');
const tokenValidator = require('../middleware/tokenValidator');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/img');
  },
  filename: function(req, file, cb) {
    console.log(file);
    const extArray = file.mimetype.split('/');
    const extension = extArray[extArray.length - 1];
    cb(null, `${file.fieldname}_${Date.now()}.${extension}`);
  },
});
const upload = multer({storage: storage});

router.get('/collections',
    handlerException(tokenValidator),
    handlerException(collectionController.index));

router.get('/collections/:id',
    handlerException(tokenValidator),
    handlerException(collectionController.getOne));

router.post('/collections',
    upload.single('file'),
    handlerException(tokenValidator),
    handlerException(collectionController.insert));

router.patch('/collections/:id',
    upload.single('file'),
    handlerException(tokenValidator),
    handlerException(collectionController.update));

router.delete('/collections/:id',
    handlerException(tokenValidator),
    handlerException(collectionController.remove));

module.exports = router;
