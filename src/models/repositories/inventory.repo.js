const { Types } = require("mongoose");
const { inventory } = require("../inventory.model");
const { convertToObjectIdMongo } = require("../../utils");

const insertInventoryRepo = async ({
  productId,
  shopId,
  stock,
  location = "unknown",
}) => {
  return await inventory.create({
    inven_productId: productId,
    inven_shopId: shopId,
    inven_stock: stock,
    inven_location: location,
  });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
      inven_productId: convertToObjectIdMongo(productId),
      inven_stock: { $gte: quantity },
    },
    updateSet = {
      $inc: { inven_stock: -quantity },
      $push: {
        inven_revations: {
          quantity,
          cartId,
          createOn: new Date(),
        },
      },
    }, options = {upsert: true, new: true};

    return inventory.updateOne(query, updateSet, options);
};

module.exports = {
  insertInventoryRepo,
  reservationInventory,
};
