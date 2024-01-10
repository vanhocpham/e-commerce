'use strict'

const {product, clothing, electronic, furniture} = require('../models/product.model');
const {BadRequestError} = require('../core/error.response');
const { 
    findAllProductForShopRepo, 
    publishProductByShopRepo,
    unPublishProductByShopRepo,
    searchProductByUserRepo,
    findAllProductsRepo,
    findProductsRepo,
    updateProductByIdRepo,
} = require('../models/repositories/product.repo');
const { removeNullObject, updateNestedObjectParser } = require('../utils');
// Define Factory class to create product
class ProductFactory {
    /**
     * type: 'Clothing',
     * payload
     */
    static productRegistry = {}

    static registerProductType(type, classRef){
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];

        if(!productClass)  throw new BadRequestError('Invalid Product Type: ' + type);

        return new productClass(payload).createProduct();
    }

    // API update product
    static async updateProduct(type, productId, payload) {
        const productClass = ProductFactory.productRegistry[type];

        if(!productClass)  throw new BadRequestError('Invalid Product Type: ' + type);

        return new productClass(payload).updateProduct(productId);
    }

    //PUT//
    static async publishProductByShop({product_shop, product_id}){

        return await publishProductByShopRepo({product_shop, product_id})
    }

    static async unPublishProductByShop({product_shop, product_id}){

        return await unPublishProductByShopRepo({product_shop, product_id})
    }

    //END PUT//

    // query draft
    static async findAllDraftsForShop({product_shop, limit = 50, skip = 0}) {
        const query = {product_shop, isDraft: true};

        return await findAllProductForShopRepo({query, limit, skip})
    }

    // query publish
    static async findAllPublishForShop({product_shop, limit = 50, skip = 0}) {
        const query = {product_shop, isPublished: true};

        return await findAllProductForShopRepo({query, limit, skip})
    }

    // query search product
    static async searchProducts({keySearch}){
        return await searchProductByUserRepo({keySearch});
    }

    // query findAll product
    static async findAllProducts({limit = 50, sort = 'ctime', page = 1, filter = {isPublished : true}}){
        return await findAllProductsRepo({limit, sort, page, filter, 
            select: ["product_name", "product_price", "product_thumb"]
        });
    }

     // query findone product
     static async findProduct({product_id}){
        return await findProductsRepo({product_id, unSelect:['__v', 'product_variations']});
    }
}

// Define base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes
    }){
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_name = product_name
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    // Create a new product
    async createProduct(product_id){
        return await product.create({
            ...this,
            _id: product_id,
        })
    }

    // Update product
    async updateProduct(productId, bodyUpdate){
        return await updateProductByIdRepo({productId, bodyUpdate, model: product})
    }
}

// Define sub-class for different product types Clothing
class Clothing extends Product {
    async createProduct(){
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if(!newClothing) throw new  BadRequestError("create new Clothing error");

        const newProduct = await super.createProduct(newClothing._id)
        if(!newProduct) throw new  BadRequestError("create new Product error");

        return newProduct;
    }

    async updateProduct(productId){
        // 1. remove attr has nul or undefined
        // 2. Check where update?
        const objectParams = this;
        if(objectParams.product_attributes){
            // update child
            await updateProductByIdRepo({productId, bodyUpdate: updateNestedObjectParser(objectParams.product_attributes), model: clothing})

        }

        const updatedProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));

        return updatedProduct;
    }
}

// Define sub-class for different product types Electronic
class Electronics extends Product {
    async createProduct(){
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if(!newElectronic) throw new  BadRequestError("create new Electronic error");

        const newProduct = await super.createProduct(newElectronic._id)
        if(!newProduct) throw new  BadRequestError("create new Product error");

        return newProduct;
    }

    async updateProduct(productId){
        const objectParams = this;
        if(objectParams.product_attributes){
            await updateProductByIdRepo({productId, bodyUpdate: updateNestedObjectParser(objectParams.product_attributes), model: electronic})

        }

        const updatedProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));

        return updatedProduct;
    }
}

// Define sub-class for different product types Furnitures
class Furnitures extends Product {
    async createProduct(){
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if(!newFurniture) throw new  BadRequestError("create new newFurniture error");

        const newProduct = await super.createProduct(newFurniture._id)
        if(!newProduct) throw new  BadRequestError("create new Product error");

        return newProduct;
    }

    async updateProduct(productId){
        const objectParams = this;
        if(objectParams.product_attributes){
            await updateProductByIdRepo({productId, bodyUpdate: updateNestedObjectParser(objectParams.product_attributes), model: furniture})

        }

        const updatedProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));

        return updatedProduct;
    }
}

// register product types
ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Furnitures', Furnitures);

module.exports = ProductFactory;