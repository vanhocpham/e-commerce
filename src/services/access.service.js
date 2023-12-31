'use strict'

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
}

class AccessService {
    static handlerRefreshTokenV2 = async ({refreshToken, user, keyStore}) => {
        const {userId, email} = user;

        if(keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happend! Pls relogin!')
        }

        if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop not registered');
        // Check email
        const foundShop = await findByEmail({email});
        if(!foundShop) throw new AuthFailureError('Shop not registered');
        console.log(foundShop)


        // create a new pair token
        //--- create privateKey and publickey with rsa-----
        const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
            },
        })
        //--- convert publicKey to string-----
        const publicKeyString = publicKey.toString();
        //--- convert publicKey string to rsa readable-----
        const publicKeyObject = crypto.createPublicKey(publicKeyString);
        const tokens = await createTokenPair({userId, email}, publicKeyObject, privateKey);

        // update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user,
            tokens,
        }
    }
    /**
     * Check this token used
     * @param {String} refreshToken 
     */
    static handlerRefreshToken = async (refreshToken) => {
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);

        if(foundToken){
            // decode found Token
            const {userId, email} = await verifyJWT(refreshToken, foundToken.publicKey)
            console.log({userId, email})

            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happend! Pls relogin!')
        }

        // NO found token
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if(!holderToken) throw new AuthFailureError('Shop not registered');

        // Verify Token
        const {userId, email} = await verifyJWT(refreshToken, holderToken.publicKey);
        console.log('[2]--', {userId, email})
        // Check UserId
        const foundShop = await findByEmail({email});
        if(!foundShop) throw new AuthFailureError('Shop not registered');
        console.log(foundShop)


        // create a new pair token
        //--- create privateKey and publickey with rsa-----
        const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
            },
        })
        //--- convert publicKey to string-----
        const publicKeyString = publicKey.toString();
        //--- convert publicKey string to rsa readable-----
        const publicKeyObject = crypto.createPublicKey(publicKeyString);
        const tokens = await createTokenPair({userId, email}, publicKeyObject, privateKey);

        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user: {userId, email},
            tokens,
        }
    }

    static logout = async(keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log({delKey})

        return delKey;
    }

    /*
        1- check mail in dbs
        2- match password
        3- create AT, RT and save
        4- generate tokens
        5- get data return login
     */
    static login = async({email, password, refreshToken = null}) => {
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new BadRequestError('Shop not registered');

        const match = bcrypt.compare(password, foundShop.password);
        if(!match) throw new AuthFailureError('Authentication error!')

        // create privateKey, publicKey
        const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
            },
        })

        console.log({privateKey, publicKey})// save collection KeyStore

        const publicKeyString = publicKey.toString();

        const publicKeyObject = crypto.createPublicKey(publicKeyString);
        // Create tokenp pair
        const tokens = await createTokenPair({userId: foundShop._id, email}, publicKeyObject, privateKey);

        await KeyTokenService.createKeytoken({
            refreshToken: tokens.refreshToken,
            userId: foundShop._id,
            publicKey: publicKey,
        })

        return {
            shop: getInfoData({fields: ['_id', 'name', 'email'], objects: foundShop}),
            tokens,
        }
    }

    static signUp = async ({name, email, password, roles}) => {
        // try {
            // Step1: check email exists?
            const holderShop = await shopModel.findOne({email}).lean();

            if(holderShop){
                throw new BadRequestError('Error: Shop already registered!')
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })
            
            if(newShop){
                // create privateKey, publicKey
                const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                      },
                    privateKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem',
                    },
                })

                console.log({privateKey, publicKey})// save collection KeyStore

                const publicKeyString = publicKey.toString();

                const publicKeyObject = crypto.createPublicKey(publicKeyString);
                // Create tokenp pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKeyObject, privateKey);

                console.log(`Created Token Success::`, tokens);

                await KeyTokenService.createKeytoken({
                    refreshToken: tokens.refreshToken,
                    userId: newShop._id,
                    publicKey: publicKey,
                })

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fields: ['_id', 'name', 'email'], objects: newShop}),
                        tokens,
                    }
                }
            }

            return {
                code: 200,
                metadata: null,
            }
        // } catch (err) {
        //     console.log(err)
        //     return {
        //         code: 'xxx',
        //         message: err.message,
        //         status: 'error',
        //     }
        // }
    }
}

module.exports = AccessService;