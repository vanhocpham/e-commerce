'use strict'

const { CREATED, SuccessResponse } = require("../core/success.response")
const ProductService = require("../services/product.service")
const ProductServiceV2 = require("../services/product.service.v2")

class ProductController {
    createProduct = async (req, res, next) => {
        // new SuccessResponse({
        //     message: 'Create Product Success!',
        //     metadata: await ProductService.createProduct(req.body.product_type, {
        //         ...req.body,
        //         product_shop: req.user.userId,
        //     })
        // }).send(res)

        new SuccessResponse({
            message: 'Create Product Success!',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId,
            })
        }).send(res)
    }


    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update Product Success!',
            metadata: await ProductServiceV2.updateProduct(req.body.product_type, req.params.productId, {
                ...req.body,
                product_shop: req.user.userId,
            })
        }).send(res)
    }

    // PUT //
    publishProductByShop = async (req, res, next) => {

        new SuccessResponse({
            message: `Publish ${req.user.userId} Success!`,
            metadata: await ProductServiceV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id,
            })
        }).send(res)
    }

    unPublishProductByShop = async (req, res, next) => {

        new SuccessResponse({
            message: `UnPublish ${req.user.userId} Success!`,
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id,
            })
        }).send(res)
    }

    // QUERY //
    getAllDraftsForShop = async (req, res, next) => {

        new SuccessResponse({
            message: 'Get list drafts Success!',
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId,
            })
        }).send(res)
    }

    getAllPublishForShop = async (req, res, next) => {

        new SuccessResponse({
            message: 'Get list publish Success!',
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId,
            })
        }).send(res)
    }

    getListSearchProduct = async (req, res, next) => {

        new SuccessResponse({
            message: 'Get list search product Success!',
            metadata: await ProductServiceV2.searchProducts(req.params)
        }).send(res)
    }

    findAllProducts = async (req, res, next) => {

        new SuccessResponse({
            message: 'Get all product Success!',
            metadata: await ProductServiceV2.findAllProducts(req.query)
        }).send(res)
    }

    findProduct = async (req, res, next) => {

        new SuccessResponse({
            message: 'Get product Success!',
            metadata: await ProductServiceV2.findProduct({product_id: req.params.product_id})
        }).send(res)
    }
    // END QUERY //
}

module.exports = new ProductController()