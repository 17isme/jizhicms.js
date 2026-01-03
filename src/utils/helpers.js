const crypto = require('crypto');
const moment = require('moment');
const { cache } = require('../config/redis');

// 工具函数集合 - 兼容OLD项目的函数

/**
 * MD5加密 - 兼容OLD项目的密码加密方式
 * @param {string} str 
 * @returns {string}
 */
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * 生成随机字符串
 * @param {number} length 
 * @returns {string}
 */
function randomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 获取当前时间戳 - 兼容OLD项目的time()函数
 * @returns {number}
 */
function time() {
  return Math.floor(Date.now() / 1000);
}

/**
 * 格式化时间 - 兼容OLD项目的时间格式
 * @param {number|Date} timestamp 
 * @param {string} format 
 * @returns {string}
 */
function formatTime(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!timestamp) return '';
  
  // 如果是10位时间戳，转换为13位
  if (timestamp.toString().length === 10) {
    timestamp = timestamp * 1000;
  }
  
  return moment(timestamp).format(format);
}

/**
 * JSON返回格式 - 兼容OLD项目的JsonReturn函数
 * @param {object} data 
 * @returns {object}
 */
function JsonReturn(data) {
  return {
    code: data.code || 0,
    msg: data.msg || 'success',
    data: data.data || null,
    ...data
  };
}

/**
 * 参数过滤和验证 - 兼容OLD项目的format_param函数
 * @param {any} value 
 * @param {number} type 0-字符串, 1-整数, 2-浮点数
 * @param {any} defaultValue 
 * @returns {any}
 */
function formatParam(value, type = 0, defaultValue = '') {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  switch (type) {
    case 1: // 整数
      const intVal = parseInt(value, 10);
      return isNaN(intVal) ? (typeof defaultValue === 'number' ? defaultValue : 0) : intVal;
    
    case 2: // 浮点数
      const floatVal = parseFloat(value);
      return isNaN(floatVal) ? (typeof defaultValue === 'number' ? defaultValue : 0) : floatVal;
    
    default: // 字符串
      return String(value).trim();
  }
}

/**
 * HTML解码 - 兼容OLD项目的html_decode函数
 * @param {string} str 
 * @returns {string}
 */
function htmlDecode(str) {
  if (!str) return '';
  
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * HTML编码
 * @param {string} str 
 * @returns {string}
 */
function htmlEncode(str) {
  if (!str) return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 获取客户端IP
 * @param {object} req 
 * @returns {string}
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for'] ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip ||
         '127.0.0.1';
}

/**
 * 构建树形结构 - 兼容OLD项目的分类树
 * @param {array} data 
 * @param {number} pid 
 * @param {string} pidField 
 * @param {string} idField 
 * @returns {array}
 */
function buildTree(data, pid = 0, pidField = 'pid', idField = 'id') {
  const tree = [];
  
  for (const item of data) {
    if (item[pidField] === pid) {
      const children = buildTree(data, item[idField], pidField, idField);
      if (children.length) {
        item.children = children;
      }
      tree.push(item);
    }
  }
  
  return tree;
}

/**
 * 分页助手函数
 * @param {number} page 
 * @param {number} pageSize 
 * @param {number} total 
 * @returns {object}
 */
function getPagination(page = 1, pageSize = 10, total = 0) {
  page = Math.max(1, parseInt(page));
  pageSize = Math.max(1, parseInt(pageSize));
  total = Math.max(0, parseInt(total));
  
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  
  return {
    page,
    pageSize,
    total,
    totalPages,
    offset,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

/**
 * 设置缓存 - 兼容OLD项目的setCache函数
 * @param {string} key 
 * @param {any} value 
 * @param {number} expire 
 * @returns {Promise<boolean>}
 */
async function setCache(key, value, expire = 1800) {
  return await cache.set(key, value, expire);
}

/**
 * 获取缓存 - 兼容OLD项目的getCache函数
 * @param {string} key 
 * @returns {Promise<any>}
 */
async function getCache(key) {
  return await cache.get(key);
}

/**
 * 删除缓存
 * @param {string} key 
 * @returns {Promise<boolean>}
 */
async function delCache(key) {
  return await cache.del(key);
}

/**
 * 语言包函数 - 兼容OLD项目的JZLANG函数
 * @param {string} key 
 * @param {string} defaultValue 
 * @returns {string}
 */
function JZLANG(key, defaultValue = '') {
  // 这里可以根据需要实现多语言支持
  // 暂时直接返回key或默认值
  return defaultValue || key;
}

module.exports = {
  md5,
  randomString,
  time,
  formatTime,
  JsonReturn,
  formatParam,
  htmlDecode,
  htmlEncode,
  getClientIP,
  buildTree,
  getPagination,
  setCache,
  getCache,
  delCache,
  JZLANG
};