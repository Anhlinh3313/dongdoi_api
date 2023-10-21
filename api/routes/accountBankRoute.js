const express = require('express');
const router = express.Router();
const middlewares = require('./middlewares');
const accountBankController = require("../controllers/accountBankController");

router.post('/insert', middlewares.authorize, accountBankController.createAccountBank);
router.put('/update/:id', middlewares.authorize, accountBankController.updateAccountBank);
router.delete('/delete/:id', middlewares.authorize, accountBankController.deleteAccountBank);
router.get('/getPaging', accountBankController.getPagingAccountBanks);
router.get('/getById/:id', accountBankController.getAccountBankById);
router.get('/getAll', accountBankController.getAllAccountBanks);
router.get('/getByBankId/:id', accountBankController.getAccountBankByBankId);

module.exports = router;