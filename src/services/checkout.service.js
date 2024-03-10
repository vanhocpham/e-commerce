'use strict'

const { BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");

class CheckoutService {
    /**
     * {
     *      cartId,
     *      userId,
     *      shop_order_ids: [
     *          
     *      ],
     * }
     * @param {*} param0 
     */
    static async chekoutReview({cartId, userId, shop_order_ids}){
        const foundCart = await findCartById(cartId);
        if(!foundCart) throw new BadRequestError("Cart does not exist");

        const checkout_order = {
            total_price: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0,
        }, shop_order_ids_new = [];

        //

    }

}

module.exports = CheckoutService;