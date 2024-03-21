"use strict";
const redis = require("redis");
const { promisify } = require("util");
const redisClient = res.createClient();

const pexpire = promisify(redisClient.pexpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setnx).bind(redisClient);

const acquireLock = async (productId, quantity, cartdId) => {
  const key = `lock_v2024_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000; // 3 seconds is lock

  for (let i = 0; i < retryTimes; i++) {
    // Create a key, a user occupied is checkout
    const result = await setnxAsync(key, expireTime);
    console.log(`result::`, result);
    if (result === 1) {
      // handle with inventory
        

      return key;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.de).bind(redisClient);
  return await delAsyncKey;
};

module.exports = {
  acquireLock,
  releaseLock,
};
