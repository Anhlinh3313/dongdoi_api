const express = require("express");
const router = express.Router();
const bannerSlideController = require("../controllers/bannerSliderController");
const middlewares = require("./middlewares");

router.post('/insert', middlewares.authorize, bannerSlideController.createSlide);
router.put('/update/:id', middlewares.authorize, bannerSlideController.updateSlide);
router.delete('/delete/:id', middlewares.authorize, bannerSlideController.deleteSlide);
router.get('/getById/:id', bannerSlideController.getSlideById);
router.get('/getPaging', bannerSlideController.getPagingSlides);
router.get('/getAll', bannerSlideController.getAllSlides);
router.get('/getByMenuSlug/:menuSlug', bannerSlideController.getSlidesByMenuSlug);

module.exports = router;