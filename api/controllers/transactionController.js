const { isValidObjectId } = require("mongoose");
const Transactions = require("../../database/entities/Transactions");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");
const {dashLogger} = require('../../logger');

async function createTransaction(req, res) {
	try {
		let transaction = new Transactions(req.body);
		let newTransaction = await transaction.save();
		let response = new ResponseModel(1, "Create account newTransaction success!", newTransaction);
		res.json(response);
	} catch (error) {
		dashLogger.error(`controller: transactionController; Request: ${req.originalUrl}; Error: ${error}`);
		let response = new ResponseModel(404, error.message, error);
		res.json(response);
	}
}

async function getAll(req, res) {
	let filterchObj = {}
	if (req.query.filter) {
		filterchObj = {
			type: { $eq: req.query.filter }
		}
	}

	try {
		let transactions = await Transactions
			.find(filterchObj)
			.sort({
				datetime: "desc",
			});

		res.json(transactions);
	} catch (error) {
		dashLogger.error(`controller: transactionController; Request: ${req.originalUrl}; Error: ${error}`);
		let response = new ResponseModel(404, error.message, error);
		res.status(404).json(response);
	}
}

async function getPagingTransaction(req, res) {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;
    let searchObj = {}
    // if (req.query.search) {
    //     searchObj = {
    //         phone: { $regex: '.*' + req.query.search + '.*' }
    //     }
    // }
    if (req.query.phone) {
		searchObj.phone = { $regex: ".*" + req.query.phone + ".*" };
	}

	if (req.query.type) {
		searchObj.type = { $regex: ".*" + req.query.type + ".*" };
	}

    try {
        let transactions = await Transactions
            .find(searchObj)
            .skip((pageSize * pageIndex) - pageSize)
            .limit(parseInt(pageSize))
            .sort({
                datetime: "desc",
            });
        let count = await Transactions.find(searchObj).countDocuments();
        let totalPages = Math.ceil(count / pageSize);
        let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, transactions);

        res.json(pagedModel);
    } catch (error) {
        dashLogger.error(`controller: transactionController; Request: ${req.originalUrl}; Error: ${error}`);
        let response = new ResponseModel(404, error.message, error);
        res.status(404).json(response);
    }
}

async function getSurplus(req, res) {
    try{
		let surplus = 0
        let transactions = await Transactions.find({type: "in"});
		transactions.forEach(item => {
			if(item.money && !isNaN(parseInt(item.money, 10))){
				surplus +=  parseInt(item.money, 10);
			}
		})
		let response = new ResponseModel(
			1,
			"get surplus success!",
			surplus
		);
		res.json(response);
    } catch (error) {
        dashLogger.error(`controller: slideController; Request: ${req.originalUrl}; Error: ${error}`);
        res.status(404).json(404, error.message, error);
    }
}

async function deleteTransaction (req, res) {
	if (isValidObjectId(req.params.id)) {
		try {
			const transaction = await Transactions.findByIdAndDelete(req.params.id);
			if (!transaction) {
				let response = new ResponseModel(0, "No item found!", null);
				res.json(response);
			} else {
				let response = new ResponseModel(
					1,
					"Delete transaction success!",
					null
				);
				res.json(response);
			}
		} catch (error) {
			dashLogger.error(`controller: transactionController; Request: ${req.originalUrl}; Error: ${error}`);
			let response = new ResponseModel(-2, error.message, error);
			res.json(response);
		}
	} else {
		res.status(404).json(new ResponseModel(404, "TransactionId is not valid!", null));
	}
}

exports.createTransaction = createTransaction;
exports.getAll = getAll;
exports.getPagingTransaction = getPagingTransaction;
exports.getSurplus = getSurplus;
exports.deleteTransaction = deleteTransaction;
