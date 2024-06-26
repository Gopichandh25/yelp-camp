const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary/index');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({
    accessToken:mapboxToken
});


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    console.log(req.body.campground.location);

    const geodata = await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send();
    console.log(geodata.body.features[0].geometry);
    campground.geometry = geodata.body.features[0].geometry;
    const imgs = req.files.map(f => ({url:f.path,filename:f.filename}));
    campground.author = req.user._id;
    campground.images = imgs;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
  }

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate(
        {
            path:'reviews',
            populate : {
                path :'author'
            }
        }
    ).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    console.log(campground);
    console.log(campground.geometry.coordinates);
    
    res.render('campgrounds/show', { campground: campground, mycoordinates : campground.geometry.coordinates  });
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f =>({
        url:f.url,
        filename:f.filename
    }))
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
            await campground.updateOne({
                $pull:{
                    images : {
                        filename : {
                            $in : req.body.deleteImages
                        }
                    }
                }
            })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}
