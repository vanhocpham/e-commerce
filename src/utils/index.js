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

const removeNullObject = obj => {
    Object.keys(obj).forEach(key => {
        if(obj[key] === null){
            delete obj[key];
        }
    })

    return obj;
}

const removeNullNestedObject = (obj) => {
    const final = {}

    Object.keys(obj).forEach(key => {
        if(typeof obj[key] === 'Object' && !Array.isArray(obj[key])){
            const response = removeNullNestedObject(obj[key]);
            Object.keys(response).forEach(k => {
                final[`${key}.${k}`] = response[k];
            })
        } else {
            final[key] = obj[key]
        }
    })

    return final;
}

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeNullObject,
    removeNullNestedObject,
}