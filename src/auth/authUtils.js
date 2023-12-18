'use strict'

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        //accessToken
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days'
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days'
        });

        JWT.verify(accessToken, publicKey, (err, decoded) => {
            if(err){
                console.error(`error verify::`, err);
            } else {
                console.log(`decode verify::`, decoded)
            }
        })

        return {
            accessToken,
            refreshToken,
        }
    } catch (err) {

    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /**
     * 1 - Check userId missing?
     * 2 - Get access token
     * 3 - Verify token
     * 4 - Check user in dbs
     * 5 - Check keyStore with this userId
     * 6 - Ok all => return next()
     * 
     */
    const userId = req.headers[HEADER.CLIENT_ID];
    if(!userId) throw new AuthFailureError('Invalide Request');

    //2
    const keyStore = await findByUserId(userId);
    if(!keyStore) throw new NotFoundError('Not found keyStore');

    //3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if(!accessToken) throw new AuthFailureError('Invalide Request');

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);

        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalide User')

        req.keyStore = keyStore;

        return next();
    } catch(e) {
        throw e;
    }

})

module.exports = {
    createTokenPair,
    authentication,
}