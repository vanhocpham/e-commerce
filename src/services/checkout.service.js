"use strict";

const { BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");

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
  static async chekoutReview({ cartId, userId, shop_order_ids }) {
    const foundCart = await findCartById(cartId);
    if (!foundCart) throw new BadRequestError("Cart does not exist");

    const checkout_order = {
        total_price: 0,
        feeShip: 0,
        totalDiscount: 0,
        totalCheckout: 0,
      },
      shop_order_ids_new = [];

    // Calculate total bill
    for (let i = 0; i < shop_order_ids_new.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i];

      // Check product available
      const checkProductServer = await checkProductByServer(item_products);
      console.log(`checkProductServer::`, checkProductServer);
      if (!checkProductServer) throw new BadRequestError("oder wrong!");

      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      };

      //   if shop_discounts exist > 0, check valid
      if (shop_discounts.length > 0) {
        // example with one discount
        // get amount discount
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        });
        // Total discount
        checkout_order.totalDiscount += discount;

        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  // order

  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.chekoutReview({
        cartId,
        userId,
        shop_order_ids,
      });

    // recheck out of stock
    // get new array products
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    console.log(`[1]::`, products);

    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
    }
  }
}

module.exports = CheckoutService;
