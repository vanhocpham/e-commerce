'use strict'

'use strict'

const { CREATED, SuccessResponse } = require("../core/success.response")
const CheckoutService = require("../services/checkout.service")

class CheckoutController {

    /**
     * @desc a
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @method POST
     * @url /v1/api/checkout
     * @return {}
     */
    checkout = async (req, res, next) => {
        new SuccessResponse({
            message: "Checkout success",
            metadata: await CheckoutService.chekoutReview(req.body)
        }).send(res)
    }

}

module.exports = new CheckoutController();