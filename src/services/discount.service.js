'use strict'

const { BadRequestError } = require("../core/error.response");
const discount = require("../models/discount.model");
const { convertToObjectIdMongo } = require("../utils");

/**
 * Discout Service
 * 1- Generator Discount Code [Shop | Admin]
 * 2- Get discount amount [User]
 * 3- Get all discount code [User | Shop]
 * 4- Verify discount code [User]
 * 5- Delete discount code [Admin | Shop]
 * 6- Cancel discount Code [User]
 * 
 */

class DiscoutService {
    static async createDiscountCode(payload){
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to, name, description,
            type, value, max_value, max_uses, uses_count, users_used, max_uses_per_user
        } = payload;

        // Check data
        if(new Date() < new Date(start_date) || new Date() > new Date(end_date)){
            throw new BadRequestError('Discount code has expired!')
        }


        // create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongo(shopId),
        }).lean()

        if(foundDiscount && foundDiscount.discount_is_active) throw new BadRequestError('Discount existed!');

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value,
            discount_shopId: shopId,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to == 'all' ? [] : product_ids,
        });

        return newDiscount;
    }
}