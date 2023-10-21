const express = require('express');
const router = express.Router();
const middlewares = require('../middlewares');
const roleController = require('../../controllers/authentication/roleController');

router.post('/insert', middlewares.authorize, roleController.createRole);
router.put('/update/:id', middlewares.authorize, roleController.updateRole);
router.delete('/delete/:id', middlewares.authorize, roleController.deleteRole);
router.get('/getPaging', roleController.getPagingRoles);
router.get('/getById/:id', roleController.getRoleById);
router.get('/getAll', roleController.getAllRoles);

module.exports = router;