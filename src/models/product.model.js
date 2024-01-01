'use strict'

const {model, Schema} = require('mongoose'); // Erase if already required
const slugify = require('slugify');
const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

// Declare the Schema of the Mongo model
var productSchema = new Schema({
    product_name:{
        type:String,
        required:true,
    },
    product_thumb:{
        type:String,
        required:true,
    },
    product_description: String,
    product_slug: String,
    product_price:{
        type: Number,
        required:true,
    },
    product_quantity:{
        type: Number,
        required:true,
    },
    product_type:{
        type:String,
        required:true,
        enum: ['Electronics', 'Clothing', 'Furnitures'],
    },
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
    },
    product_attributes: {
        type: Schema.Types.Mixed,
        required: true,
    },
    // more
    product_ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1,'Rating must be above 1.0'],
        max: [5,'Rating must be above 5.0'],
        // 4,345555 => 4.3
        set: (value) => Math.round(value*10)/10
    },
    product_variations: {
        type: Array,
        default: [],
    },
    isDarft: {
        type: Boolean,
        default: true,
        index: true,
        select: false,
    },
    isPublic: {
        type: Boolean,
        default: false,
        index: true,
        select: false,
    }
}, {
    timestamps: true,
    colection: COLLECTION_NAME,
});

// Document middleware runs before .save() and .create()
productSchema.pre('save', (next) => {
    this.product_slug = slugify(this.product_name, {lower: true});
    next();
})


// Define the product type = clothing
const clothingSchema = new Schema({
    brand:{
        type: String,
        required:true,
    },
    size: String,
    material: String,
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
    },
}, {
    collation: 'Clothing',
    timestamps: true,
})

// Define the product type = electronics
const electronicSchema = new Schema({
    manufacturer:{
        type: String,
        required:true,
    },
    model: String,
    color: String,
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
    },
}, {
    collation: 'Electronics',
    timestamps: true,
})

// Define the product type = furnitures
const furnituresSchema = new Schema({
    brand:{
        type: String,
        required:true,
    },
    size: String,
    material: String,
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
    },
}, {
    collation: 'furnitures',
    timestamps: true,
})




//Export the model
module.exports = {
   product: model(DOCUMENT_NAME, productSchema),
   electronic: model('Electronics', electronicSchema),
   clothing: model('Clothing', clothingSchema),
   furniture: model('Furnitures', furnituresSchema),
}