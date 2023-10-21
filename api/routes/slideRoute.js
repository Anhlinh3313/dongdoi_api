const express = require("express");
const router = express.Router();
const slideController = require("../controllers/slideController");
const middlewares = require("./middlewares");

router.post('/insert', middlewares.authorize, slideController.createSlide);
router.put('/update/:id', middlewares.authorize, slideController.updateSlide);
router.delete('/delete/:id', middlewares.authorize, slideController.deleteSlide);
router.get('/getById/:id', slideController.getSlideById);
router.get('/getPaging', slideController.getPagingSlides);
router.get('/getAll', slideController.getAllSlides);

module.exports = router;