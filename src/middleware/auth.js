const jwt = require('jsonwebtoken');
const { Level } = require('../models');

// 管理员身份验证中间件 - 兼容OLD项目的session验证机制
const adminAuth = async (req, res, next) => {
  try {
    // 优先检查session中的管理员信息（兼容OLD项目）
    if (req.session && req.session.admin && req.session.admin.id) {
      // 从数据库验证用户是否仍然有效
      const admin = await Level.findByPk(req.session.admin.id);
      if (admin) {
        req.admin = admin.toJSON();
        return next();
      }
    }

    // 检查JWT token（新的验证方式）
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies.adminToken;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.APP_SECRET);
      const admin = await Level.findByPk(decoded.id);
      
      if (admin) {
        req.admin = admin.toJSON();
        return next();
      }
    }

    // 如果是页面请求，重定向到登录页面
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/admin/login');
    }
    
    return res.status(401).json({
      code: 1,
      msg: '请先登录管理后台'
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      code: 1,
      msg: '登录状态已失效，请重新登录'
    });
  }
};

// 权限检查中间件
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const admin = req.admin;
      
      // 超级管理员跳过权限检查
      if (admin.isadmin === 1) {
        return next();
      }

      // 检查用户权限
      let purviews = [];
      try {
        purviews = admin.purviews ? JSON.parse(admin.purviews) : [];
      } catch (e) {
        purviews = admin.purviews ? admin.purviews.split(',') : [];
      }

      if (!purviews.includes(permission)) {
        return res.status(403).json({
          code: 1,
          msg: '权限不足'
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        code: 1,
        msg: '权限检查失败'
      });
    }
  };
};

module.exports = {
  adminAuth,
  checkPermission
};