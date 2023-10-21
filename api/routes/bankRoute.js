const express = require('express');
const router = express.Router();
const middlewares = require('./middlewares');
const bankController = require("../controllers/bankController");

router.post('/insert', middlewares.authorize, bankController.createBank);
router.put('/update/:id', middlewares.authorize, bankController.updateBank);
router.delete('/delete/:id', middlewares.authorize, bankController.deleteBank);
router.get('/getPaging', bankController.getPagingBanks);
router.get('/getById/:id', bankController.getBankById);
router.get('/getAll', bankController.getAllBanks);

module.exports = router;