const { isValidObjectId } = require("mongoose");
const AccountBanks = require("../../database/entities/AccountBanks");
const Banks = require("../../database/entities/Banks");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");
const {dashLogger} = require('../../logger');
const { default: axios } = require("axios");
const { clearAccentsDiacritics } = require("../../utilities/ClearAccentsDiacritics");

async function createAccountBank(req, res) {
	if (req.actions.includes("createAccountBank")) {
		try {
			if(req.body.accountName){
				req.body.accountName = clearAccentsDiacritics(req.body.accountName).toUpperCase();
			}
			let accountBank = new AccountBanks(req.body);
			accountBank.createdTime = Date.now();
			let newAccountBank = await accountBank.save();
			let response = new ResponseModel(1, "Create account bank success!", newAccountBank);
			res.json(response);
		} catch (error) {
			dashLogger.error(`controller: accountBankController; Request: ${req.originalUrl}; Error: ${error}`);
			let response = new ResponseModel(404, error.message, error);
			res.json(response);
		}
	} else {	
		res.sendStatus(403);
	}
}

async function updateAccountBank(req, res) {
	if (req.actions.includes("updateAccountBank")) {
		try {
			let newAccountBank = {
				updatedTime: Date.now(),
				user: req.userId,
				...req.body,
			};
			let updatedAccountBank = await AccountBanks.findOneAndUpdate(
				{ _id: req.params.id },
				newAccountBank
			);
			if (!updatedAccountBank) {
				let response = new ResponseModel(0, "No item found!", null);
				res.json(response);
			} else {
				let response = new ResponseModel(
					1,
					"Update account bank success!",
					newAccountBank
				);
				res.json(response);
			}
		} catch (error) {
			dashLogger.error(`controller: accountBankController; Request: ${req.originalUrl}; Error: ${error}`);
			let response = new ResponseModel(404, error.message, error);
			res.json(response);
		}
	} else {
		res.sendStatus(403);
	}
}

async function deleteAccountBank(req, res) {
	if (req.actions.includes("deleteAccountBank")) {
		if (isValidObjectId(req.params.id)) {
			try {
				const accountBank = await AccountBanks.findByIdAndDelete(req.params.id);
				if (!accountBank) {
					let response = new ResponseModel(0, "No item found!", null);
					res.json(response);
				} else {
					let response = new ResponseModel(
						1,
						"Delete account bank success!",
						null
					);
					res.json(response);
				}
			} catch (error) {
				dashLogger.error(`controller: accountBankController; Request: ${req.originalUrl}; Error: ${error}`);
				let response = new ResponseModel(-2, error.message, error);
				res.json(response);
			}
		} else {
			res.status(404).json(new ResponseModel(404, "AccountBankId is not valid!", null));
		}
	} else {
		res.sendStatus(403);
	}
}

async function getPagingAccountBanks(req, res) {
	let pageSize = req.query.pageSize || 10;
	let pageIndex = req.query.pageIndex || 1;

	let searchObj = {};
	if (req.query.search) {
		searchObj = { accountName: { $regex: ".*" + req.query.search + ".*" } };
	}
	try {
		let accountBanks = await AccountBanks.find(searchObj)
			.skip(pageSize * pageIndex - pageSize)
			.limit(parseInt(pageSize))
			.populate('bank')
			.sort({
				createdTime: "desc",
			});
			
		let count = await AccountBanks.find(searchObj).countDocuments();
		let totalPages = Math.ceil(count / pageSize);
		let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, accountBanks);
		res.json(pagedModel);
	} catch (error) {
		dashLogger.error(`controller: accountBankController; Request: ${req.originalUrl}; Error: ${error}`);
		let response = new ResponseModel(404, error.message, error);
		res.status(404).json(response);
	}
}

async function getAccountBankById(req, res) {
	if (isValidObjectId(req.params.id)) {
		try {
			let accountBank = await AccountBanks.findById(req.params.id);
			res.json(accountBank);
		} catch (error) {
			dashLogger.error(`controller: accountBankController; Request: ${req.originalUrl}; Error: ${error}`);
			res.status(404).json(404, error.message, error);
		}
	} else {
		res.status(404).json(new ResponseModel(404, "AccountBankId is not valid!", null));
	}
}

async function getAllAccountBanks(req, res) {
	try {
		let accountBanks = await AccountBanks.find({});
		res.json(accountBanks);
	} catch (error) {
		let response = new ResponseModel(404, error.message, error);
		res.status(404).json(response);
	}
}

async function getAccountBankByBankId(req, res) {
	if (isValidObjectId(req.params.id)) {
		try {
			Banks.findById(req.params.id , async (error, bank) => {
				if (error) {
				    return  res.status(404).json(new ResponseModel(404, error.message, error));
				} else {
				  	if (bank) {
						let searchObj = {
							bank: bank._id,
						};
						
						let accountBank = await AccountBanks.findOne(searchObj).populate('bank');
						if(accountBank != null){
						    let data = {
								accountBank,
								qrDataURL: `https://img.vietqr.io/image/${bank?.code}-${accountBank?.accountNo}-compact2.jpg?accountName=${accountBank?.accountName}`
							}
							res.json(data);
						} else {
							res.status(404).json(new ResponseModel(404, "Account Bank was not found!", null));
						}
					} else {
						res
						.status(404)
						.json(new ResponseModel(404, "Bank was not found!", null));
					}
				}
			  });
		} catch (error) {
			dashLogger.error(`controller: accountBankController; Request: ${req.originalUrl}; Error: ${error}`);
			res.status(404).json(404, error.message, error);
		}
	} else {
		res.status(404).json(new ResponseModel(404, "BankId is not valid!", null));
	}
}

exports.createAccountBank = createAccountBank;
exports.updateAccountBank = updateAccountBank;
exports.deleteAccountBank = deleteAccountBank;
exports.getPagingAccountBanks = getPagingAccountBanks;
exports.getAccountBankById = getAccountBankById;
exports.getAllAccountBanks = getAllAccountBanks;
exports.getAccountBankByBankId = getAccountBankByBankId;