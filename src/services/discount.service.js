'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discount = require("../models/discount.model");
const { findAllDiscountCodesUnselect, checkDiscountExists } = require("../models/repositories/discount.repo");
const { convertToObjectIdMongo } = require("../utils");
const { findAllProducts } = require("./product.service.v2");

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

    //  update discount code
    static async updateDiscountCode(params){

    }

    /**
     * Get all discount codes available with products
     */
    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit, page
    }){
       // create index for discount code
       const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongo(shopId),
        }).lean()

        if(!foundDiscount || !foundDiscount.discount_is_active){
            throw new NotFoundError('Discount code not found!')
        }

        const {discount_applies_to, discount_product_ids} = foundDiscount;
        let products;

        if(discount_applies_to === 'all'){
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongo(shopId),
                    is_published: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        if(discount_applies_to === 'specific'){
            products = await findAllProducts({
                filter: {
                    _id: {$in: discount_product_ids},
                    is_published: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        return products;
    }

    /**
     * Get all discount codes of Shop
     */

    static async getAllDiscountCodesByShop({
        limit, page, shopId
    }){
        const discounts = await findAllDiscountCodesUnselect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongo(shopId),
                discount_is_active: true,
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount,
        })

        return discounts;
    }

    /**
     * Apply discount code
     * 
        products = [
            {
                productId,
                shopId,
                quantity,
                name,
                price,
            },
            {
                productId,
                shopId,
                quantity,
                name,
                price,
            }
        ]
     */
    static async getDiscountAmount({codeId, userId, shopId, products}){
        // Happy New Year 2024 - khai code
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongo(shopId)
            }
        });

        if(!foundDiscount) throw new NotFoundError('Discount code not found!');

        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_max_order_value,
            discount_users_used,
            discount_type,
            discount_value,
        } = foundDiscount;

        if(!discount_is_active) throw new NotFoundError('Discount expired!');
        if(!discount_max_uses) throw new NotFoundError('Discount are out!');

        if(new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)){
            throw new NotFoundError('Discount are expired!');
        }

        // check min value of cost
        let totalOrder = 0;
        if(discount_min_order_value > 0){
            // get total
            totalOrder = products.reduce((acc, product) => {
                return acc + product.quantity * product.price
            }, 0)

            if(totalOrder < discount_min_order_value){
                throw new NotFoundError(`Discount require a minimum order value of ${discount_min_order_value}!`);
            
            }
        }

        if(discount_max_order_value > 0){
            const userUsedDiscount = discount_users_used.find(user => user.userId === userId);

            if(userUsedDiscount){

            }
        }

        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount,
        }
    }

    static async deleteDiscount(){

    }

    static async cancelDiscountCode(){
        //ok
        
    }
}