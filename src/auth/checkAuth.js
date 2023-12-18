'use strict'

const { findApiKeyById } = require("../services/apikey.service");

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
}

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString();

        if(!key){
            return res.status(403).json({
                message: 'Forbidden Error'
            })
        }
        // Check objKey
        const objKey = await findApiKeyById(key);

        if(!objKey){
            return res.status(403).json({
                message: 'Forbidden Error!'
            })
        }

        req.objKey = objKey;

        return next();
    } catch (err) {
        console.error(err);
    }
}

const permission = (permission) => {
    return (req, res, next) => {
        if(!req.objKey.permissions){
            return res.status(403).json({
                message: 'Permission Denied!'
            })
        }

        console.log('Permisisons::', req.objKey.permissions)
        const validPermission = req.objKey.permissions.includes(permission);

        if(!validPermission){
            return res.status(403).json({
                message: 'Permission Denied!'
            })
        }

        return next();
    }
}

module.exports = {
    apiKey,
    permission,
}