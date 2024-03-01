'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response");
const {cart} = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");
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

    // Update Cart
    /*
        shop_order_ids: [
            {
                shopId,
                item_products: [
                    quantity,
                    price,
                    shopId,
                    old_quantity,
                    productId
                ],
                version
            }
        ]
     
     */

    static async addToCartV2({userId, shop_order_ids = {}}){
        const {productId, quantity, old_quantity} = shop_order_ids[0]?.item_products[0]
        //check product
        const foundProduct = await getProductById({productId})

        if(!foundProduct) throw new NotFoundError('Product Not Found!')

        if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId){
            throw new NotFoundError('Product do not belong to the shop!')
        }

        if(quantity === 0){
            //deleted

            return await CartService.deleteUserCart({userId, productId})
        }

        return await CartService.updateUserCartQuantity({userId, product: {productId, quantity: quantity - old_quantity}},)
    }

    static async deleteUserCart({userId, productId}){
        const query = {cart_userId: userId, cart_state: 'active'},
        updateSet = {
            $pull: {
                cart_products: {
                    productId,
                }
            }
        }

        const deleteCart = await cart.updateOne(query, updateSet);

        return deleteCart;
    }

    static async getListUserCart({userId}){
        return await cart.findOne({
            cart_userId: userId,
        }).lean()
    }
}

module.exports = CartService;