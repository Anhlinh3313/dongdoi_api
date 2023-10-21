const Posts = require("../../database/entities/Posts");
const Menus = require("../../database/entities/Menus");
const PagedModel = require('../models/PagedModel');
const ResponseModel = require('../models/ResponseModel');
const { isValidObjectId, Types } = require('mongoose');
const { dashLogger } = require('../../logger');

async function createPost(req, res) {
  if (req.actions.includes("createPost")) {
    try {
      let post = new Posts(req.body);
      post.createdTime = Date.now();
      await post.save((err, newPost) => {
        if (err) {
          let response = new ResponseModel(-2, err.message, err);
          res.json(response);
        } else {
          let response = new ResponseModel(1, "Create post success!", newPost);
          res.json(response);
        }
      });
    } catch (error) {
      dashLogger.error(`controller: postController; Request: ${req.originalUrl}; Error: ${error}`);
      let response = new ResponseModel(404, error.message, error);
      res.status(404).json(response);
    }
  } else {
    res.sendStatus(403);
  }
}

async function updatePost(req, res) {
  if (req.actions.includes("updatePost")) {
    try {
      let newPost = { updatedTime: Date.now(), user: req.userId, ...req.body };
      let updatedPost = await Posts.findOneAndUpdate(
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

async function deletePost(req, res) {
  if (req.actions.includes("deletePost")) {
    if (isValidObjectId(req.params.id)) {
      try {
        let post = await Posts.findByIdAndDelete(req.params.id);
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

async function getFuturePosts(req, res) {
  const searchObj = { highlight: true };
  const pageSize = req.query.pageSize || 10;
  const pageIndex = req.query.pageIndex || 1;

  try {
    const posts = await Posts.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .populate("user")
      .populate("menu")
      .select("_id title slug description thumb category createdTime numberOfReader user")
      .sort({ createdTime: "desc" });

    // Xử lý dữ liệu và trả về kết quả
    res.json(posts);
  } catch (error) {
    console.log(error);
    dashLogger.error(`controller: postController; Request: ${req.originalUrl}; Error: ${error}`);
    res.status(404).json(new ResponseModel(404, error.message, error));
  }

}


const getPagingPosts = async (req, res) => {
  try {
    const pageSize = req.query.pageSize || 10;
    const pageIndex = req.query.pageIndex || 1;

    let searchObj = { highlight: false };

    if (req.query.search && req.query.status) {
      searchObj = {
        ...searchObj,
        status: req.query.status,
        $or: [
          { title: { $regex: ".*" + req.query.search + ".*" } },
          { slug: { $regex: ".*" + req.query.search + ".*" } },
          { description: { $regex: ".*" + req.query.search + ".*" } },
        ],
      };
    } else if (req.query.search) {
      searchObj = {
        ...searchObj,
        $or: [
          { title: { $regex: ".*" + req.query.search + ".*" } },
          { slug: { $regex: ".*" + req.query.search + ".*" } },
          { description: { $regex: ".*" + req.query.search + ".*" } },
        ],
      };
    } else if (req.query.status) {
      searchObj = {
        ...searchObj,
        status: req.query.status,
      };
    }



    const totalItems = await Posts.countDocuments(searchObj);
    const totalPages = Math.ceil(totalItems / pageSize);

    const posts = await Posts.find(searchObj)
      .skip(pageSize * (pageIndex - 1))
      .limit(pageSize)
      .populate("user")
      .populate("menu")
      .select("_id title slug description thumb category createdTime numberOfReader user")
      .sort({ createdTime: "desc" });

    const pagedModel = new PagedModel(pageIndex, pageSize, totalPages, posts);
    res.json(pagedModel);
  } catch (error) {
    console.log(error);
    dashLogger.error(`controller: postController; Request: ${req.originalUrl}; Error: ${error}`);
    res.status(404).json(new ResponseModel(404, error.message, error));
  }
};


async function getPostById(req, res) {
  if (isValidObjectId(req.params.id)) {
    try {
      let post = await Posts.findById(req.params.id)
        .populate("user")
        .populate("menu");
      if (post.menu != null) {
        let menu = await Menus.find({ _id: post.menu._id });
        if (menu.parent != null) {
          let menuParent = await Menus.find({ _id: menu.parent.id });
          post.menu.parent = menuParent;
        }
      }
      if (post) {
        res.json(post);
      } else {
        res
          .status(404)
          .json(new ResponseModel(404, "Post was not found", null));
      }
    } catch (error) {
      dashLogger.error(`controller: postController; Request: ${req.originalUrl}; Error: ${error}`);
      res.status(404).json(new ResponseModel(404, error.message, error));
    }
  } else {
    res.status(404).json(new ResponseModel(404, "PostId is not valid!", null));
  }
}

async function getPostBySlug(req, res) {
  try {
    let post = await Posts.findOne({ slug: req.params.slug })
      .populate("user")
      .populate("menu");
    if (post) {
      post.numberOfReader += 1;
      await post.save();
      res.json(post);
    } else {
      res.status(404).json(404, "Post was not found", null);
    }
  } catch (error) {
    dashLogger.error(`controller: postController; Request: ${req.originalUrl}; Error: ${error}`);
    res.status(404).json(new ResponseModel(404, error.message, error));
  }
}

async function getPostsByMenuSlug(req, res) {
  let pageSize = req.query.pageSize || 10;
  let pageIndex = req.query.pageIndex || 1;
  try {
    Menus.findOne({ menuSlug: req.params.menuSlug }, (error, menu) => {
      if (error) {
        res.status(404).json(new ResponseModel(404, error.message, error));
      } else {
        if (menu) {
          let searchObj = {
            status: 1,
            menu: menu._id,
          };

          if (req.query.search) {
            searchObj = {
              status: 1,
              menu: menu._id,
              title: { $regex: ".*" + req.query.search + ".*" },
            };
          }

          Posts.find(searchObj)
            .skip(pageSize * pageIndex - pageSize)
            .limit(parseInt(pageSize))
            .populate("user")
            .select(
              req.params.menuSlug === "video"
                ? "_id title slug description content thumb menu createdTime numberOfReader user"
                : "_id title slug description content thumb menu createdTime numberOfReader user"
            )
            .sort({
              createdTime: "desc",
            })
            .exec((error, posts) => {
              if (error) {
                res
                  .status(404)
                  .json(new ResponseModel(404, error.message, error));
              } else {
                posts = posts.map((post) => {
                  if (
                    post.user != undefined &&
                    post.user != null &&
                    post.user != ""
                  ) {
                    post.user.password = "";
                    return post;
                  } else {
                    return post;
                  }
                });
                let totalPages = Math.ceil(posts.length / pageSize);
                let pagedModel = new PagedModel(
                  pageIndex,
                  pageSize,
                  totalPages,
                  posts
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
  } catch (error) {
    dashLogger.error(`controller: postController; Request: ${req.originalUrl}; Error: ${error}`);
    res.status(404).json(new ResponseModel(404, error.message, error));
  }  
}

async function searchPostsByTitle(req, res) {
  try {
    let search = req.query.q;
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;
    let query = {};
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
    Posts.find(query)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .populate("user")
      .populate("menu")

      .select(
        "_id title slug description thumb menu createdTime numberOfReader user"
      )
      .exec((err, data) => {
        if (err) {
          res.status(404).json(new ResponseModel(404, err.message, err));
        }
        return res.json(data);
      });
  } catch (error) {
    dashLogger.error(`controller: postController; Request: ${req.originalUrl}; Error: ${error}`);
    res.status(404).json(new ResponseModel(404, error.message, error));
  }
}

async function getPostXML(req, res) {
  try {
    Posts.find({ post_status: 1 })
      .sort({ createdTime: -1 })
      .select("id title slug createdTime")
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

async function getNumberOfReader(req, res) {
  try {
    let posts = await Posts.find()
      .limit(req.query.limit ?? 1)
      .select("-content")
      .sort({
        numberOfReader: "desc",
      });
    res.json(posts);
  } catch (error) {
    res.status(404).json(new ResponseModel(404, error.message, error));
  }
}

async function getPagingPostsV2(req, res) {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;

    let searchObj = {};
    if (req.query.status) {
      searchObj.status = req.query.status;
    }
    if (req.query.title) {
      searchObj.title = { $regex: ".*" + req.query.title + ".*" };
    }
    if (req.query.slug) {
      searchObj.slug = { $regex: ".*" + req.query.slug + ".*" };
    }
    if (req.query.description) {
      searchObj.description = { $regex: ".*" + req.query.description + ".*" };
    }
    try {
      let posts = await Posts.find(searchObj)
        .skip(pageSize * pageIndex - pageSize)
        .limit(parseInt(pageSize))
        .populate("user")
        .populate("menu")
        .sort({
          createdTime: "desc",
        });
      let menuList = await Menus.find({});

      posts = posts.map((post) => {
        if (post && post.menu && post.menu.parent != null) {
          let parent = menuList.find(
            (item) => item.id.toString() == post.menu.parent.toString()
          );
          post.menu.parent = parent;
        }

        if (post.user) {
          post.user.password = "";
          return post;
        } else {
          return post;
        }
      });

      let totalPages = Math.ceil(posts.length / pageSize);
      let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, posts);
      res.json(pagedModel);
    } catch (error) {
      res.status(404).json(new ResponseModel(404, error.message, error));
    }
}

exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.getPagingPosts = getPagingPosts;
exports.getFuturePosts = getFuturePosts;
exports.getPostById = getPostById;
exports.getPostBySlug = getPostBySlug;
exports.getPostsByMenuSlug = getPostsByMenuSlug;
exports.searchPostsByTitle = searchPostsByTitle;
exports.getNumberOfReader = getNumberOfReader;
exports.getPostXML = getPostXML;
exports.getPagingPostsV2 = getPagingPostsV2;