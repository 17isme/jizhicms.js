const redis = require('redis');
require('dotenv').config();

// Redis配置 - 兼容OLD项目的Redis设置
const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  retryDelayOnClusterDown: 300,
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  commandTimeout: 5000
};

// 添加密码认证（如果配置了）
if (process.env.REDIS_AUTH) {
  redisConfig.password = process.env.REDIS_AUTH;
}

const client = redis.createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
    connectTimeout: redisConfig.connectTimeout
  },
  password: redisConfig.password,
  database: redisConfig.db
});

client.on('error', (err) => {
  console.error('Redis连接错误:', err);
});

client.on('connect', () => {
  console.log('Redis连接成功');
});

client.on('ready', () => {
  console.log('Redis已准备就绪');
});

// 连接Redis
(async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error('Redis连接失败:', error);
  }
})();

// 缓存工具函数 - 兼容OLD项目的缓存接口
const cache = {
  // 设置缓存 - 对应OLD项目的setCache函数
  async set(key, value, expire = 1800) {
    try {
      const data = typeof value === 'object' ? JSON.stringify(value) : value;
      if (expire > 0) {
        await client.setEx(key, expire, data);
      } else {
        await client.set(key, data);
      }
      return true;
    } catch (error) {
      console.error('缓存设置失败:', error);
      return false;
    }
  },

  // 获取缓存 - 对应OLD项目的getCache函数
  async get(key) {
    try {
      const data = await client.get(key);
      if (!data) return null;
      
      // 尝试解析JSON
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      console.error('缓存获取失败:', error);
      return null;
    }
  },

  // 删除缓存
  async del(key) {
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error('缓存删除失败:', error);
      return false;
    }
  },

  // 检查缓存是否存在
  async exists(key) {
    try {
      return await client.exists(key);
    } catch (error) {
      console.error('缓存检查失败:', error);
      return false;
    }
  },

  // 设置过期时间
  async expire(key, seconds) {
    try {
      await client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('设置过期时间失败:', error);
      return false;
    }
  }
};

module.exports = { client, cache };