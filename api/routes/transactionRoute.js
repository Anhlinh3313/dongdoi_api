const express = require('express');
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.post('/createTransaction', transactionController.createTransaction);
router.get('/getAll', transactionController.getAll);
router.get('/getPagingTransaction', transactionController.getPagingTransaction);
router.get('/getSurplus', transactionController.getSurplus);
router.delete('/delete/:id',  transactionController.deleteTransaction);

module.exports = router;