'use strict'

const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {

    static createKeytoken = async ({userId, publicKey}) => {
        try {
            const publicKeyString = publicKey.toString();
            const token = await keytokenModel.create({
                user: userId,
                publicKey: publicKeyString,
            })

            return token ? token.publicKey : null;
        } catch (err) {
            return err;
        }
    }
}

module.exports = KeyTokenService