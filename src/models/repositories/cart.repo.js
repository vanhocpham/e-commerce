'use strict'

const { Types } = require("mongoose")
const {cart} = require("../cart.model")
const { getSelectData, unGetSelectData, convertToObjectIdMongo } = require('../../utils');

const findCartById = async(cartId) => {
    return await cart.findOne({_id: convertToObjectIdMongo(cartId), cart_state: 'active'}).lean();
}

module.exports = {
    findCartById
}