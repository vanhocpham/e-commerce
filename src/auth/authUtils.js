'use strict'

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id',
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
        req.user = decodeUser;
        req.accessToken = accessToken;

        return next();
    } catch(e) {
        throw e;
    }

})


const authenticationV2 = asyncHandler(async (req, res, next) => {
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
    if(req.headers[HEADER.REFRESHTOKEN]){
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN]
            const decodeUser = JWT.verify(refreshToken, keyStore.publicKey);
            console.log("================decodeUser================", decodeUser)
            if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid User')
    
            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;
    
            return next();
        } catch(e) {
            throw e;
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if(!accessToken) throw new AuthFailureError('Invalide Request');

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);

        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalide User')

        req.keyStore = keyStore;
        req.user = decodeUser;
        req.accessToken = accessToken;

        return next();
    } catch(e) {
        throw e;
    }

})

const verifyJWT = async (token, keyStore) => {
    return await JWT.verify(token, keyStore)
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    authenticationV2
}