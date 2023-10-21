const { isValidObjectId } = require("mongoose");
const Actions = require("../../../database/entities/authentication/Actions");
const PagedModel = require("../../models/PagedModel");
const ResponseModel = require("../../models/ResponseModel");
const {dashLogger} = require('../../../logger');

async function createAction(req, res) {
	if (req.actions.includes("createAction")) {
		try {
			let action = new Actions(req.body);
			action.createdTime = Date.now();
			let newAction = await action.save();
			let response = new ResponseModel(1, "Create action success!", newAction);
			res.json(response);
		} catch (error) {
			dashLogger.error(`controller: actionController; Request: ${req.originalUrl}; Error: ${error}`);
			let response = new ResponseModel(404, error.message, error);
			res.json(response);
		}
	} else {	
		res.sendStatus(403);
	}
}

async function updateAction(req, res) {
	if (req.actions.includes("updateAction")) {
		try {
			let newAction = {
				updatedTime: Date.now(),
				user: req.userId,
				...req.body,
			};
			let updatedAction = await Actions.findOneAndUpdate(
				{ _id: req.params.id },
				newAction
			);
			if (!updatedAction) {
				let response = new ResponseModel(0, "No item found!", null);
				res.json(response);
			} else {
				let response = new ResponseModel(
					1,
					"Update action success!",
					newAction
				);
				res.json(response);
			}
		} catch (error) {
			dashLogger.error(`controller: actionController; Request: ${req.originalUrl}; Error: ${error}`);
			let response = new ResponseModel(404, error.message, error);
			res.json(response);
		}
	} else {
		res.sendStatus(403);
	}
}

async function deleteAction(req, res) {
	if (req.actions.includes("deleteAction")) {
		if (isValidObjectId(req.params.id)) {
			try {
				const action = await Actions.findByIdAndDelete(req.params.id);
				if (!action) {
					let response = new ResponseModel(0, "No item found!", null);
					res.json(response);
				} else {
					let response = new ResponseModel(
						1,
						"Delete action success!",
						null
					);
					res.json(response);
				}
			} catch (error) {
				dashLogger.error(`controller: actionController; Request: ${req.originalUrl}; Error: ${error}`);
				let response = new ResponseModel(-2, error.message, error);
				res.json(response);
			}
		} else {
			res.status(404).json(new ResponseModel(404, "ActionId is not valid!", null));
		}
	} else {
		res.sendStatus(403);
	}
}

async function getPagingActions(req, res) {
	let pageSize = req.query.pageSize || 10;
	let pageIndex = req.query.pageIndex || 1;

	let searchObj = {};
	if (req.query.search) {
		searchObj = { actionName: { $regex: ".*" + req.query.search + ".*" } };
	}
	try {
		let actions = await Actions.find(searchObj)
			.skip(pageSize * pageIndex - pageSize)
			.limit(parseInt(pageSize))
			.sort({
				createdTime: "desc",
			});
		let count = await Actions.find(searchObj).countDocuments();
		let totalPages = Math.ceil(count / pageSize);
		let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, actions);
		res.json(pagedModel);
	} catch (error) {
		dashLogger.error(`controller: actionController; Request: ${req.originalUrl}; Error: ${error}`);
		let response = new ResponseModel(404, error.message, error);
		res.status(404).json(response);
	}
}

async function getActionById(req, res) {
	if (isValidObjectId(req.params.id)) {
		try {
			let action = await Actions.findById(req.params.id);
			res.json(action);
		} catch (error) {
			dashLogger.error(`controller: actionController; Request: ${req.originalUrl}; Error: ${error}`);
			res.status(404).json(404, error.message, error);
		}
	} else {
		res.status(404).json(new ResponseModel(404, "ActionId is not valid!", null));
	}
}

async function getAllActions(req, res) {
	try {
		let actions = await Actions.find({});
		res.json(actions);
	} catch (error) {
		let response = new ResponseModel(404, error.message, error);
		res.status(404).json(response);
	}
}

exports.createAction = createAction;
exports.updateAction = updateAction;
exports.deleteAction = deleteAction;
exports.getPagingActions = getPagingActions;
exports.getActionById = getActionById;
exports.getAllActions = getAllActions;

