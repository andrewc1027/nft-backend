const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const NftController = require('../controllers/NftPhotoController');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const tokenValidator = require('../middleware/tokenValidator');

router.get('/photos',
    handlerException(tokenValidator),
    handlerException(NftController.index));

router.get('/photo/:id',
    handlerException(tokenValidator),
    handlerException(NftController.getOne));

router.post('/photo',
    upload.single('file'),
    handlerException(tokenValidator),
    handlerException(NftController.insert));

router.patch('/photo/:id',
    handlerException(tokenValidator),
    handlerException(NftController.update));

router.delete('/photo/:id',
    handlerException(tokenValidator),
    handlerException(NftController.remove));

module.exports = router;
