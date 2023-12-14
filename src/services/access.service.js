'use strict'

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
}

class AccessService {
    static logo = async({email, password}) => {
        
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