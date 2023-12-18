'use strict'

const { Types } = require("mongoose");
const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {

    static createKeytoken = async ({userId, publicKey, refreshToken}) => {
        try {
            const publicKeyString = publicKey.toString();
            // const token = await keytokenModel.create({
            //     user: userId,
            //     publicKey: publicKeyString,
            // })

            // return token ? token.publicKey : null;

            const filter = {user: userId}, update = {
                publicKey: publicKeyString, resfreshTokenUsed: [], refreshToken
            }, options = {upsert: true, new: true}

            const token = await keytokenModel.findOneAndUpdate(filter, update, options);

            return token ? token.publicKey : null;
        } catch (err) {
            return err;
        }
    }

    static findByUserId = async (userId) => {
        return await keytokenModel.findOne({user: userId}).lean();
    }

    static removeKeyById = async (id) => {
        return await keytokenModel.deleteOne({_id: id});
    }
}

module.exports = KeyTokenService