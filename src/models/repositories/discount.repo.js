'use strict'
const { Types } = require("mongoose")
const discount = require("../discount.model")
const { getSelectData, unGetSelectData } = require('../../utils');

const findAllDiscountCodesUnselect = async ({
    limit = 50, page = 1, sort = 'ctime',
    filter, unSelect, model
}) => {
    const skip = (page - 1)*limit ;
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1};
    const documents = await model.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unSelect))
    .lean();

    return documents;
}

const findAllDiscountCodesSelect = async ({
    limit = 50, page = 1, sort = 'ctime',
    filter, select, model
}) => {
    const skip = (page - 1)*limit ;
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1};
    const documents = await model.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(select))
    .lean();

    return documents;
}

const checkDiscountExists = (model, filter) => {
    const foundDiscount = await model.findOne(filter).lean()

    return foundDiscount;
}

module.exports = {
    findAllDiscountCodesUnselect,
    findAllDiscountCodesSelect,
    checkDiscountExists
}