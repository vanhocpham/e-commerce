'use strict'

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
}

class AccessService {

    static signUp = async ({name, email, password, roles}) => {
        try {
            // Step1: check email exists?
            const holderShop = await shopModel.findOne({email}).lean();

            if(holderShop){
                return {
                    code: 'xxx',
                    message: 'Shop already exists!'
                }
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })
            
            if(newShop){
                // create privateKey, publicKey
                const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    // publicKeyEncoding: {
                    //     type: 'spki',
                    //     format: 'pem',
                    //   },
                    //   privateKeyEncoding: {
                    //     type: 'pkcs8',
                    //     format: 'pem',
                    //     cipher: 'aes-256-cbc',
                    //     passphrase: 'top secret',
                    //   },
                })

                console.log({privateKey, publicKey})// save collection KeyStore

                const publicKeyString = await KeyTokenService.createKeytoken({
                    userId: newShop._id,
                    publicKey: publicKey,
                })

                if(!publicKeyString){
                    return {
                        code: 'xxx',
                        status: 'publicKeyString error',
                    }
                }

                // Create tokenp pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey);

                console.log(`Created Token Success::`, tokens);

                return {
                    code: 201,
                    metadata: {
                        shop: newShop,
                        tokens,
                    }
                }
            }

            return {
                code: 200,
                metadata: null,
            }
        } catch (err) {
            console.log(err)
            return {
                code: 'xxx',
                message: err.message,
                status: 'error',
            }
        }
    }
}

module.exports = AccessService;