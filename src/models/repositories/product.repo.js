'use strict'

const { Types } = require('mongoose');
const {product, electronic, clothing, furniture} = require('../../models/product.model');
const { getSelectData, unGetSelectData, convertToObjectIdMongo } = require('../../utils');

const findAllProductForShopRepo = async ({query, limit, skip}) => {
    return await product
            .find(query)
            .populate('product_shop', 'name email -_id')
            .sort({updateAt: -1})
            .skip(skip)
            .limit(limit)
            .lean()
            .exec()
}

const searchProductByUserRepo = async ({keySearch}) => {
    const regexSearch = new RegExp(keySearch);
    const results = await product.find(
        {
            $text:{$search: regexSearch},
            isPublished: true,
        },
        {
            score: {$meta: 'textScore'}
        }
    ).sort({score: {$meta: 'textScore'}}).lean();

    return results;
}

const publishProductByShopRepo = async ({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    });

    if(!foundShop) return null;

    foundShop.isDraft = false;
    foundShop.isPublished = true;

    const {modifiedCount} = await foundShop.updateOne(foundShop);

    return modifiedCount;
}

const unPublishProductByShopRepo = async ({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    });

    if(!foundShop) return null;

    foundShop.isDraft = true;
    foundShop.isPublished = false;

    const {modifiedCount} = await foundShop.updateOne(foundShop);

    return modifiedCount;
}

const findAllProductsRepo = async ({limit, sort, page, filter, select}) => {
    const skip = (page - 1)*limit ;
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1};
    const products = await product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

    return products;
}

const findProductsRepo = async ({product_id, unSelect}) => {
    
    return await product.findById(product_id).select(unGetSelectData(unSelect));
}

const updateProductByIdRepo = async ({productId, bodyUpdate, model, isNew = true}) => {
    return await model.findByIdAndUpdate({_id: productId}, bodyUpdate, {new: isNew});
}

const getProductById = async ({productId})=>{
    return await product.findOne({_id: convertToObjectIdMongo(productId)})
}

const checkProductByServer = async (products) => {
    return await Promise.all(products.map(async (product) => {
        const foundProduct = await getProductById(product.productId);
        if(foundProduct){
            return {
                price: foundProduct.product_price,
                quantity: product.quantity,
                productId: product.productId,
            }
        }
    }))
}

module.exports = {
    findAllProductForShopRepo,
    publishProductByShopRepo,
    unPublishProductByShopRepo,
    searchProductByUserRepo,
    findAllProductsRepo,
    findProductsRepo,
    updateProductByIdRepo,
    getProductById,
    checkProductByServer,
}