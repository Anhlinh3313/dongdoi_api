const Slides = require('../../database/entities/Slides');
const PagedModel = require('../models/PagedModel');
const ResponseModel = require('../models/ResponseModel');
const { isValidObjectId, Types } = require('mongoose');
const {dashLogger} = require('../../logger');

async function createSlide(req, res) {
    if (req.actions.includes('createSlide')) {
        try {
            let slide = new Slides(req.body);
            slide.createdTime = Date.now();
            slide.user = req.userId;
            let newSlide = await slide.save();
            let response = new ResponseModel(1, 'Create slide success!', newSlide);
            res.json(response);
        } catch (error) {
            dashLogger.error(`controller: slideController; Request: ${req.originalUrl}; Error: ${error}`);
            let response = new ResponseModel(404, error.message, error);
            res.status(404).json(response);
        }
    }
    else {
        res.sendStatus(403);
    }
}

async function updateSlide(req, res) {
    if (req.actions.includes('updateSlide')) {
        try {
            let newSlide = { updatedTime: Date.now(), user: req.userId, ...req.body };
            let updatedSlide = await Slides.findOneAndUpdate({ _id: req.params.id }, newSlide);
            if (!updatedSlide) {
                let response = new ResponseModel(0, 'No item found!', null)
                res.json(response);
            }
            else {
                let response = new ResponseModel(1, 'Update slide success!', newSlide)
                res.json(response);
            }
        }
        catch (error) {
            dashLogger.error(`controller: slideController; Request: ${req.originalUrl}; Error: ${error}`);
            let response = new ResponseModel(404, error.message, error);
            res.status(404).json(response);
        }
    }
    else {
        res.sendStatus(403);
    }
}

async function deleteSlide(req, res) {
    if (req.actions.includes('deleteSlide')) {
        if (isValidObjectId(req.params.id)) {
            try {
                let slide = await Slides.findByIdAndDelete(req.params.id);
                if (!slide) {
                    let response = new ResponseModel(0, 'No item found!', null);
                    res.json(response);
                }
                else {
                    let response = new ResponseModel(1, 'Delete slide success!', null);
                    res.json(response);
                }
            } catch (error) {
                dashLogger.error(`controller: slideController; Request: ${req.originalUrl}; Error: ${error}`);
                let response = new ResponseModel(404, error.message, error)
                res.status(404).json(response);
            }
        }
        else {
            res.status(404).json(new ResponseModel(404, 'MenuId is not valid!', null));
        }
    }
    else {
        res.sendStatus(403);
    }
}

async function getPagingSlides(req, res) {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;
    let searchObj = {}
    if (req.query.search) {
        searchObj = {
            link: { $regex: '.*' + req.query.search + '.*' }
        }
    }

    try {
        let slides = await Slides
            .find(searchObj)
            .skip((pageSize * pageIndex) - pageSize)
            .limit(parseInt(pageSize))
            .populate("user")
            .sort({
                createdTime: 'desc'
            });

        let count = await Slides.find(searchObj).countDocuments();
        let totalPages = Math.ceil(count / pageSize);
        let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, slides);

        res.json(pagedModel);
    } catch (error) {
        dashLogger.error(`controller: slideController; Request: ${req.originalUrl}; Error: ${error}`);
        let response = new ResponseModel(404, error.message, error);
        res.status(404).json(response);
    }
}

async function getSlideById(req, res) {
    if (isValidObjectId(req.params.id)) {
        try {
            let slide = await Slides.findById(req.params.id);
            res.json(slide);
        } catch (error) {
            dashLogger.error(`controller: slideController; Request: ${req.originalUrl}; Error: ${error}`);
            res.status(404).json(404, error.message, error);
        }
    }
    else {
        res.status(404).json(new ResponseModel(404, 'SlideId is not valid!', null));
    }
}

async function getAllSlides(req, res) {
    try{
        let slides = await Slides.find();
        res.json(slides);
    } catch (error) {
        dashLogger.error(`controller: slideController; Request: ${req.originalUrl}; Error: ${error}`);
        res.status(404).json(404, error.message, error);
    }
}

exports.createSlide = createSlide;
exports.updateSlide = updateSlide;
exports.deleteSlide = deleteSlide;
exports.getPagingSlides = getPagingSlides;
exports.getSlideById = getSlideById;
exports.getAllSlides = getAllSlides;