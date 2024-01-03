'use strict'

const { Types } = require('mongoose');
const {product, electronic, clothing, furniture} = require('../../models/product.model');

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

module.exports = {
    findAllProductForShopRepo,
    publishProductByShopRepo,
    unPublishProductByShopRepo,
    searchProductByUserRepo,
}