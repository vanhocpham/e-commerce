'use strict'

const { CREATED, SuccessResponse } = require("../core/success.response")
const DiscountService = require("../services/discount.service")

class DiscountController {
    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: "Create Discount Code Successful",
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId,
            })
        })
    }

    getAllDiscountCodes = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all Successful",
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId,
            })
        })
    }

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: "Get discount amount Successful",
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
            })
        })
    }

    getAllDiscountCodesWithProducts = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all Successful",
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query,
            })
        })
    }
}


module.exports = new DiscountController();