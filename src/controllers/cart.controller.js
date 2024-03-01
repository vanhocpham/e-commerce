'use strict'

const { CREATED, SuccessResponse } = require("../core/success.response")
const CartService = require("../services/cart.service")

class CartController {

    /**
     * @desc add to cart for user
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @method POST
     * @url /v1/api/cart/users
     * @return {}
     */
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new cart success",
            metadata: await CartService.addToCart(req.body)
        }).send(res)
    }

    update = async (req, res, next) => {
        new SuccessResponse({
            message: "Update cart success",
            metadata: await CartService.addToCartV2(req.body)
        }).send(res)
    }


    delete = async (req, res, next) => {
        new SuccessResponse({
            message: "Delete cart success",
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res)
    }

    listToCart = async (req, res, next) => {
        new SuccessResponse({
            message: "list cart success",
            metadata: await CartService.getListUserCart(req.body)
        }).send(res)
    }

}

module.exports = new CartController();