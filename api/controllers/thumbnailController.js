const Thumbnail = require("../../database/entities/Thumbnail");
const Menus = require("../../database/entities/Menus");
const PagedModel = require('../models/PagedModel');
const ResponseModel = require('../models/ResponseModel');
const { isValidObjectId, Types } = require('mongoose');
const { dashLogger } = require('../../logger');

async function createThumbnail(req, res) {
    if (req.actions.includes("createThumbnail")) {
        try {
            let thumbnail = new Thumbnail(req.body);
            thumbnail.createdTime = Date.now();
            await thumbnail.save((err, newPost) => {
                if (err) {
                    let response = new ResponseModel(-2, err.message, err);
                    res.json(response);
                } else {
                    let response = new ResponseModel(1, "Create thumbnail success!", newPost);
                    res.json(response);
                }
            });
        } catch (error) {
            dashLogger.error(`controller: thumbnailController; Request: ${req.originalUrl}; Error: ${error}`);
            let response = new ResponseModel(404, error.message, error);
            res.status(404).json(response);
        }
    } else {
        res.sendStatus(403);
    }
}

async function updateThumbnail(req, res) {
    if (req.actions.includes("updateThumbnail")) {
        try {
            let newPost = { updatedTime: Date.now(), user: req.userId, ...req.body };
            let updatedPost = await Thumbnail.findOneAndUpdate(
                { _id: req.params.id },
                newPost
            );
            if (!updatedPost) {
                let response = new ResponseModel(0, "No item found!", null);
                res.json(response);
            } else {
                let response = new ResponseModel(1, "Update post success!", newPost);
                res.json(response);
            }
        } catch (error) {
            dashLogger.error(`controller: postController; Request: ${req.originalUrl}; Error: ${error}`);
            let response = new ResponseModel(404, error.message, error);
            res.status(404).json(response);
        }
    } else {
        res.sendStatus(403);
    }
}

async function deleteThumbnail(req, res) {
    if (req.actions.includes("deleteThumbnail")) {
        if (isValidObjectId(req.params.id)) {
            try {
                let post = await Thumbnail.findByIdAndDelete(req.params.id);
                if (!post) {
                    let response = new ResponseModel(0, "No item found!", null);
                    res.json(response);
                } else {
                    let response = new ResponseModel(1, "Delete post success!", null);
                    res.json(response);
                }
            } catch (error) {
                dashLogger.error(`controller: postController; Request: ${req.originalUrl}; Error: ${error}`);
                let response = new ResponseModel(404, error.message, error);
                res.status(404).json(response);
            }
        } else {
            res
                .status(404)
                .json(new ResponseModel(404, "PostId is not valid!", null));
        }
    } else {
        res.sendStatus(403);
    }
}

async function getPagingThumbnail(req, res) {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;

    let searchObj = {};
    if (req.query.search && req.query.status) {
        searchObj = {
            status: req.query.status,
            $or: [
                { title: { $regex: ".*" + req.query.search + ".*" } },
                { slug: { $regex: ".*" + req.query.search + ".*" } },
                { description: { $regex: ".*" + req.query.search + ".*" } },
            ],
        };
    }
    if (req.query.search || req.query.status) {
        if (req.query.search) {
            searchObj = {
                $or: [
                    { title: { $regex: ".*" + req.query.search + ".*" } },
                    { slug: { $regex: ".*" + req.query.search + ".*" } },
                    { description: { $regex: ".*" + req.query.search + ".*" } },
                ],
            };
        } else {
            searchObj = {
                status: req.query.status,
            };
        }
    }

    try {
        let thumbnail = await Thumbnail.find(searchObj)
            .skip(pageSize * pageIndex - pageSize)
            .limit(parseInt(pageSize))
            .populate("user")
            .populate("menu")
            .sort({
                createdTime: "desc",
            });
        thumbnail = thumbnail.map((thumb) => {
            if (thumb.user != undefined && thumb.user != null && thumb.user != "") {
                thumb.user.password = "";
                return thumb;
            } else {
                return thumb;
            }
        });
        let totalPages = Math.ceil(thumbnail.length / pageSize);
        let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, thumbnail);
        res.json(pagedModel);
    } catch (error) {
        console.log(error);
        dashLogger.error(`controller: postController; Request: ${req.originalUrl}; Error: ${error}`);
        res.status(404).json(new ResponseModel(404, error.message, error));
    }
}

async function getThubnailById(req, res) {
    if (isValidObjectId(req.params.id)) {
        try {
            let thumbnail = await Thumbnail.findById(req.params.id)
                .populate("user")
                .populate("menu");
            if (thumbnail.menu != null) {
                let menu = await Menus.find({ _id: thumbnail.menu._id });
                if (menu.parent != null) {
                    let menuParent = await Menus.find({ _id: menu.parent.id });
                    thumbnail.menu.parent = menuParent;
                }
            }
            if (thumbnail) {
                res.json(thumbnail);
            } else {
                res
                    .status(404)
                    .json(new ResponseModel(404, "Thumbnail was not found", null));
            }
        } catch (error) {
            dashLogger.error(`controller: thumbnailController; Request: ${req.originalUrl}; Error: ${error}`);
            res.status(404).json(new ResponseModel(404, error.message, error));
        }
    } else {
        res.status(404).json(new ResponseModel(404, "ThubnailID is not valid!", null));
    }
}

async function getThumbnailBySlug(req, res) {
    try {
        let thumbnail = await Thumbnail.findOne({ slug: req.params.slug })
            .populate("user")
            .populate("menu");
        if (post) {
            thumbnail.numberOfReader += 1;
            await thumbnail.save();
            res.json(thumbnail);
        } else {
            res.status(404).json(404, "thumbnail was not found", null);
        }
    } catch (error) {
        dashLogger.error(`controller: thumbnailController; Request: ${req.originalUrl}; Error: ${error}`);
        res.status(404).json(new ResponseModel(404, error.message, error));
    }
}

async function getThumbnailByMenuSlug(req, res) {
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

                Thumbnail.find(searchObj)
                    .skip(pageSize * pageIndex - pageSize)
                    .limit(parseInt(pageSize))
                    .populate("user")
                    .populate("menu")
                    .sort({
                        createdTime: "desc",
                    })
                    .exec((error, thumbnail) => {
                        if (error) {
                            res
                                .status(404)
                                .json(new ResponseModel(404, error.message, error));
                        } else {
                            thumbnail = thumbnail.map((thumb) => {
                                if (
                                    thumb.user != undefined &&
                                    thumb.user != null &&
                                    thumb.user != ""
                                ) {
                                    thumb.user.password = "";
                                    return thumb;
                                } else {
                                    return thumb;
                                }
                            });
                            let totalPages = Math.ceil(thumbnail.length / pageSize);
                            let pagedModel = new PagedModel(
                                pageIndex,
                                pageSize,
                                totalPages,
                                thumbnail
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

async function searchThumbnailByTitle(req, res) {
    try {
        let search = req.query.q;
        let pageSize = req.query.pageSize || 10;
        let pageIndex = req.query.pageIndex || 1;
        let query = {};
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
        ];
        Thumbnail.find(query)
            .skip(pageSize * pageIndex - pageSize)
            .limit(parseInt(pageSize))
            .populate("user")
            .populate("menu")
            .exec((err, data) => {
                if (err) {
                    res.status(404).json(new ResponseModel(404, err.message, err));
                }
                return res.json(data);
            });
    } catch (error) {
        dashLogger.error(`controller: thumbnailController; Request: ${req.originalUrl}; Error: ${error}`);
        res.status(404).json(new ResponseModel(404, error.message, error));
    }
}

async function getThumbnailXML(req, res) {
    try {
        Thumbnail.find({ post_status: 1 })
            .sort({ createdTime: -1 })
            .allowDiskUse(true)
            .exec((err, data) => {
                if (err) {
                    dashLogger.error(`Error : ${err}, Request : ${req.originalUrl}`);
                    return res.status(400).json({
                        message: err.message,
                    });
                }
                return res.json(data);
            });
    } catch (error) {
        dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
        return res.status(400).json({ message: error.message });
    }
};


exports.createThumbnail = createThumbnail;
exports.updateThumbnail = updateThumbnail;
exports.deleteThumbnail = deleteThumbnail;
exports.getPagingThumbnail = getPagingThumbnail;
exports.getThubnailById = getThubnailById;
exports.getThumbnailBySlug = getThumbnailBySlug;
exports.getThumbnailByMenuSlug = getThumbnailByMenuSlug;
exports.searchThumbnailByTitle = searchThumbnailByTitle;
exports.getThumbnailXML = getThumbnailXML;