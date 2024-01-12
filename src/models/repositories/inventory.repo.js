const { Types } = require("mongoose")
const { inventory } = require("../inventory.model")


const insertInventoryRepo = async ({
    productId, shopId, stock, location = 'unknown'
}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_shopId: shopId,
        inven_stock: stock,
        inven_location: location,
    })
}


module.exports = {
    insertInventoryRepo,

}