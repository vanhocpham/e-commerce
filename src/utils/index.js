'use strict'

const _ = require('lodash');
const {Types} = require('mongoose');

const convertToObjectIdMongo = id => Types.ObjectId(id);

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

const updateNestedObjectParser = (obj) => {
    const final = {}

    Object.keys(obj).forEach(key => {
        if(obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])){
            const response = updateNestedObjectParser(obj[key]);
            Object.keys(response).forEach(k => {
                if(response[k] !== null){
                    final[`${key}.${k}`] = response[k];
                }
            })
        } else {
            if(obj[key] !== null){
                final[key] = obj[key]
            }
        }
    })

    return final;
}

module.exports = {
    convertToObjectIdMongo,
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeNullObject,
    updateNestedObjectParser,
}