'use strict'

'use strict'

const { CREATED, SuccessResponse } = require("../core/success.response")
const InventoryService = require("../services/inventory.service")

class InventoryController {

    /**
     * @desc a
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @method POST
     * @url /v1/api/inventory
     * @return {}
     */
    addStockToInventory = async (req, res, next) => {
        new SuccessResponse({
            message: "Checkout success",
            metadata: await InventoryService.addStockToInventory(req.body)
        }).send(res)
    }

}

module.exports = new InventoryController();