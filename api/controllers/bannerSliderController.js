const BannerSlides = require('../../database/entities/BannerSlides');
const Menus = require("../../database/entities/Menus");
const PagedModel = require('../models/PagedModel');
const ResponseModel = require('../models/ResponseModel');
const { isValidObjectId, Types } = require('mongoose');
const { dashLogger } = require('../../logger');

async function createSlide(req, res) {
    if (req.actions.includes('createBannerSlides')) {
        try {
            let slide = new BannerSlides(req.body);
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
    if (req.actions.includes('updateBannerSlides')) {
        try {
            let newSlide = { updatedTime: Date.now(), user: req.userId, ...req.body };
            let updatedSlide = await BannerSlides.findOneAndUpdate({ _id: req.params.id }, newSlide);
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
    if (req.actions.includes('deleteBannerSlides')) {
        if (isValidObjectId(req.params.id)) {
            try {
                let slide = await BannerSlides.findByIdAndDelete(req.params.id);
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
        let bannerSlides = await BannerSlides
            .find(searchObj)
            .skip((pageSize * pageIndex) - pageSize)
            .limit(parseInt(pageSize))
            .populate("user")
            .sort({
                createdTime: 'desc'
            });

        let count = await BannerSlides.find(searchObj).countDocuments();
        let totalPages = Math.ceil(count / pageSize);
        let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, bannerSlides);

        res.json(pagedModel);
    } catch (error) {
        dashLogger.error(`controller: BannerSlides; Request: ${req.originalUrl}; Error: ${error}`);
        let response = new ResponseModel(404, error.message, error);
        res.status(404).json(response);
    }
}

async function getSlideById(req, res) {
    if (isValidObjectId(req.params.id)) {
        try {
            let BannerSlides = await BannerSlides.findById(req.params.id);
            res.json(BannerSlides);
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
    try {
        let BannerSlides = await BannerSlides.find();
        res.json(BannerSlides);
    } catch (error) {
        dashLogger.error(`controller: slideController; Request: ${req.originalUrl}; Error: ${error}`);
        res.status(404).json(404, error.message, error);
    }
}


async function getSlidesByMenuSlug(req, res) {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;

    Menus.findOne({ menuSlug: req.params.menuSlug }, (error, menu) => {
        if (error) {
            res.status(404).json(new ResponseModel(404, error.message, error));
        } else {
            if (menu) {
                let searchObj = {
                    menu: menu._id,
                };

                if (req.query.search) {
                    searchObj = {
                        menu: menu._id,
                        title: { $regex: ".*" + req.query.search + ".*" },
                    };
                }

                BannerSlides.find(searchObj)
                    .skip(pageSize * pageIndex - pageSize)
                    .limit(parseInt(pageSize))
                    .sort({
                        createdTime: "desc",
                    })
                    .exec((error, slider) => {
                        if (error) {
                            res
                                .status(404)
                                .json(new ResponseModel(404, error.message, error));
                        } else {
                            slider = slider.map((post) => {
                                if (
                                    slider.user != undefined &&
                                    slider.user != null &&
                                    slider.user != ""
                                ) {
                                    slider.user.password = "";
                                    return post;
                                } else {
                                    return post;
                                }
                            });
                            let totalPages = Math.ceil(slider.length / pageSize);
                            let pagedModel = new PagedModel(
                                pageIndex,
                                pageSize,
                                totalPages,
                                slider
                            );
                            res.json(pagedModel);
                        }
                    });
            } else {
                res
                    .status(404)
                    .json(new ResponseModel(404, "Menu was not found!", null));
            }
        }
    });
}

exports.createSlide = createSlide;
exports.updateSlide = updateSlide;
exports.deleteSlide = deleteSlide;
exports.getPagingSlides = getPagingSlides;
exports.getSlideById = getSlideById;
exports.getAllSlides = getAllSlides;
exports.getSlidesByMenuSlug = getSlidesByMenuSlug;