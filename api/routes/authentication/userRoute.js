const express = require('express');
const router = express.Router();
const userController = require('../../controllers/authentication/userController');
const middlewares = require('../middlewares');

router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/insert', middlewares.authorize, userController.insertUser);
router.put('/update/:id', middlewares.authorize, userController.updateUser);
router.delete('/delete/:id', middlewares.authorize, userController.deleteUser);
router.get('/getById/:id', middlewares.authorize, userController.getUserById);
router.get('/getPaging', middlewares.authorize, userController.getPaging);
router.post('/otpSendmail/:id', userController.otpSendmail);
router.post('/forgotPassword', userController.forgotPassword);
router.get('/getAll', middlewares.authorize, userController.getAllUsers);

module.exports = router;