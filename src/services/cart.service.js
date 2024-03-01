'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response");
const {cart} = require("../models/cart.model")
/**
 * Key features: Cart Services
 * - Add product to cart (user)
 * - reduce product quantity by one (user)
 * - increase product quantity by one (user)
 * - get cart (user)
 * - delete all cart (user)
 * - delete cart items (user)
 */

class CartService {
    // Start Repo Cart //
    static async createUserCart({userId, product}){
        const query = {cart_userId: userId, cart_start: 'activce'},
        updateOrInsert = {
            $addToSet: {
                cart_products: product,
            }
        }, options = {upsert: true, new: true}

        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }

    static async updateUserCartQuantity({userId, product}){
        const {productId, quantity} = product;
        const query = {
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active',
        }, updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity,
            }
        }, options = {upsert: true, new: true}
       

        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }
    // End Repo Cart //

    static async addToCart({userId, product = {}}){
        // check cart exists
        const userCart = await cart.findOne({cart_userId: userId});

        if(!userCart){
            return await CartService.createUserCart({userId, product});
        }

        if(!userCart.cart_products.length){
            userCart.cart_products = [product];

            return await userCart.save();
        }

        return await CartService.updateUserCartQuantity({userId, product})
    }
}

module.exports = CartService;