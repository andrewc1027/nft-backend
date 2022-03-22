const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const userController = require('../controllers/userController');
const tokenValidator = require('../middleware/tokenValidator');
const multer = require('multer');
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
const upload = multer({storage: storage});
const multi = upload.fields([
  {name: 'logoImage', maxCount: 1},
  {name: 'bannerImage', maxCount: 1},
]);
/**
 * These Routes are for seller page
 */
router.post('/user/:address', handlerException(userController.findAndRegister));

router.get('/users/me',
    handlerException(tokenValidator),
    handlerException(userController.me));

router.get('/users/:id',
    handlerException(tokenValidator),
    handlerException(userController.find));

router.get('/users/username/:username',
    handlerException(userController.getUserByUsername));

router.patch('/users',
    multi,
    handlerException(tokenValidator),
    handlerException(userController.update));

router.patch('/users/verify',
    multi,
    handlerException(tokenValidator),
    handlerException(userController.verify));

router.get('/users/:wallet/check',
    handlerException(userController.checkWallet));

router.post('/users/:id/verify',
    handlerException(tokenValidator),
    handlerException(userController.sendVerifyEmail));

module.exports = router;
