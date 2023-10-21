const express = require("express");
const router = express.Router();
const thumbnailController = require("../controllers/thumbnailController");
const middlewares = require("./middlewares");

router.post('/insert', middlewares.authorize, thumbnailController.createThumbnail);
router.put('/update/:id', middlewares.authorize, thumbnailController.updateThumbnail);
router.delete('/delete/:id', middlewares.authorize, thumbnailController.deleteThumbnail);
router.get('/getById/:id', thumbnailController.getThubnailById);
router.get('/getBySlug/:slug', thumbnailController.getThumbnailBySlug);
router.get('/getPaging', thumbnailController.getPagingThumbnail);
router.get('/searchPostsByTitle', thumbnailController.searchThumbnailByTitle);
router.get('/getByMenuSlug/:menuSlug', thumbnailController.getThumbnailByMenuSlug);
router.get("/getPosts/sitemap", thumbnailController.getThumbnailXML);

module.exports = router;