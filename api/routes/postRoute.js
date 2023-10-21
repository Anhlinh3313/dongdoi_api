const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const middlewares = require("./middlewares");

router.post('/insert', middlewares.authorize, postController.createPost);
router.put('/update/:id', middlewares.authorize, postController.updatePost);
router.delete('/delete/:id', middlewares.authorize, postController.deletePost);
router.get('/getById/:id', postController.getPostById);
router.get('/getBySlug/:slug', postController.getPostBySlug);
router.get('/getPaging', postController.getPagingPosts);
router.get('/getNumberOfReader', postController.getNumberOfReader);
router.get('/searchPostsByTitle', postController.searchPostsByTitle);
router.get('/getByMenuSlug/:menuSlug', postController.getPostsByMenuSlug);
router.get("/getPosts/sitemap", postController.getPostXML);
router.get('/getPagingV2', postController.getPagingPostsV2);
router.get('/getFuture', postController.getFuturePosts);

module.exports = router;