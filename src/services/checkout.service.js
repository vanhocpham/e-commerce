'use strict'

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

    }

}

module.exports = CheckoutService;