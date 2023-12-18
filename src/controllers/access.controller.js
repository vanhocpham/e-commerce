'use strict'

const { CREATED, SuccessResponse } = require("../core/success.response")
const AccessService = require("../services/access.service")

class AccessController {
    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login(req.body),
        }).send(res)
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout Success!',
            metadata: await AccessService.logout(req.keyStore)
        }).send(res)
    }

    signUp = async (req, res, next) => {


        new CREATED({
            message: 'Registed OK!',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10,
            }
        }).send(res);
    }

}

module.exports = new AccessController()