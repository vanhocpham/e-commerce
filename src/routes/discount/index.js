'use strict'

const express = require('express');
const discountController = require('../../controllers/discount.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

// Get amount a discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount))
router.post('/list_discount_code', asyncHandler(discountController.getAllDiscountCodesWithProducts))

// authentication //
router.use(authenticationV2)
router.post('', asyncHandler(discountController.createDiscountCode))
router.get('', asyncHandler(discountController.getAllDiscountCodes))


module.exports = router;