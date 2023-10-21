const { isValidObjectId } = require("mongoose");
const Banks = require("../../database/entities/Banks");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");
const {dashLogger} = require('../../logger');

async function createBank(req, res) {
	if (req.actions.includes("createBank")) {
		try {
			let bank = new Banks(req.body);
			bank.createdTime = Date.now();
			let newBank = await bank.save();
			let response = new ResponseModel(1, "Create bank success!", newBank);
			res.json(response);
		} catch (error) {
			dashLogger.error(`controller: bankController; Request: ${req.originalUrl}; Error: ${error}`);
			let response = new ResponseModel(404, error.message, error);
			res.json(response);
		}
	} else {	
		res.sendStatus(403);
	}
}

async function updateBank(req, res) {
	if (req.actions.includes("updateBank")) {
		try {
			let newBank = {
				updatedTime: Date.now(),
				user: req.userId,
				...req.body,
			};
			let updatedBank = await Banks.findOneAndUpdate(
				{ _id: req.params.id },
				newBank
			);
			if (!updatedBank) {
				let response = new ResponseModel(0, "No item found!", null);
				res.json(response);
			} else {
				let response = new ResponseModel(
					1,
					"Update bank success!",
					newBank
				);
				res.json(response);
			}
		} catch (error) {
			dashLogger.error(`controller: bankController; Request: ${req.originalUrl}; Error: ${error}`);
			let response = new ResponseModel(404, error.message, error);
			res.json(response);
		}
	} else {
		res.sendStatus(403);
	}
}

async function deleteBank(req, res) {
	if (req.actions.includes("deleteBank")) {
		if (isValidObjectId(req.params.id)) {
			try {
				const bank = await Banks.findByIdAndDelete(req.params.id);
				if (!bank) {
					let response = new ResponseModel(0, "No item found!", null);
					res.json(response);
				} else {
					let response = new ResponseModel(
						1,
						"Delete bank success!",
						null
					);
					res.json(response);
				}
			} catch (error) {
				dashLogger.error(`controller: bankController; Request: ${req.originalUrl}; Error: ${error}`);
				let response = new ResponseModel(-2, error.message, error);
				res.json(response);
			}
		} else {
			res.status(404).json(new ResponseModel(404, "BankId is not valid!", null));
		}
	} else {
		res.sendStatus(403);
	}
}

async function getPagingBanks(req, res) {
	let pageSize = req.query.pageSize || 10;
	let pageIndex = req.query.pageIndex || 1;

	let searchObj = {};
	if (req.query.search) {
		searchObj = { code: { $regex: ".*" + req.query.search + ".*" } };
	}
	try {
		let banks = await Banks.find(searchObj)
			.skip(pageSize * pageIndex - pageSize)
			.limit(parseInt(pageSize))
			.sort({
				createdTime: "desc",
			});
		let count = await Banks.find(searchObj).countDocuments();
		let totalPages = Math.ceil(count / pageSize);
		let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, banks);
		res.json(pagedModel);
	} catch (error) {
		dashLogger.error(`controller: bankController; Request: ${req.originalUrl}; Error: ${error}`);
		let response = new ResponseModel(404, error.message, error);
		res.status(404).json(response);
	}
}

async function getBankById(req, res) {
	if (isValidObjectId(req.params.id)) {
		try {
			let bank = await Banks.findById(req.params.id);
			res.json(bank);
		} catch (error) {
			dashLogger.error(`controller: bankController; Request: ${req.originalUrl}; Error: ${error}`);
			res.status(404).json(404, error.message, error);
		}
	} else {
		res.status(404).json(new ResponseModel(404, "BankId is not valid!", null));
	}
}

async function getAllBanks(req, res) {
	try {
		let banks = await Banks.find({});
		res.json(banks);
	} catch (error) {
		let response = new ResponseModel(404, error.message, error);
		res.status(404).json(response);
	}
}

exports.createBank = createBank;
exports.updateBank = updateBank;
exports.deleteBank = deleteBank;
exports.getPagingBanks = getPagingBanks;
exports.getBankById = getBankById;
exports.getAllBanks = getAllBanks;