'use strict'

const _ = require('lodash');

const getInfoData = ({fields = [], objects = {}}) => {
    return _.pick(objects, fields)
}

// [a, b] => {a: 1, b: 1}
const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el , 1]))
}

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el , 0]))
}

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
}