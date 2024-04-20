const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds =  require('../controllers/campgrounds.js');

const { isLoggedIn,validateCampground,isAuthor } = require('../middleware');
const Campground = require('../models/campground');
const { renderEditForm } = require('../controllers/campgrounds');
const {storage} = require('../cloudinary/index.js');
const multer = require('multer');
const upload = multer({storage});


router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.post('/', isLoggedIn, upload.array('image'),validateCampground, catchAsync(campgrounds.createCampground))

// router.post('/',upload.array('image'),(req,res)=>{
//     console.log(req.body);
//     console.log(req.files);
// } )

router.get('/:id', catchAsync(campgrounds.showCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'),validateCampground, catchAsync(campgrounds.editCampground));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;