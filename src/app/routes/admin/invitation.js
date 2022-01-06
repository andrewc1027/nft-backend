const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../../exceptions/handler');
const invController = require('../../controllers/admin/invitationController');
const admin = require('../../middleware/admin');

router.get('/admin/invitations',
    handlerException(admin),
    handlerException(invController.index));

router.post('/admin/invitations',
    handlerException(admin),
    handlerException(invController.add));

router.post('/admin/invitations',
    handlerException(admin),
    handlerException(invController.add));

router.delete('/admin/invitations/:id',
    handlerException(admin),
    handlerException(invController.remove));

module.exports = router;
