'use strict'

const JWT = require('jsonwebtoken');
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

module.exports = {
    createTokenPair
}