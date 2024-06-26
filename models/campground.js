const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;
const User = require('./user');

const opts = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema({
    title: String,
    images : [{
        url:String,
        filename: String
    }],
    price: Number,
    description: String,
    location: String,
    author :{
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    geometry:{
        type:{
            type:String,
            enum : ['Point'],
            required:true
        },
        coordinates :{
            type : [Number],
            required: true
        }
    }
},opts);

CampgroundSchema.virtual('properties.popupData').get(function(){
    return `<a href='/campgrounds/${this._id}'>${this.title} </a>`
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);