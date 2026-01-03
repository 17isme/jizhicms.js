const express = require('express');
const router = express.Router();

// API控制器
const ArticleApiController = require('../controllers/api/ArticleController');
const ClasstypeApiController = require('../controllers/api/ClasstypeController');
const CommentApiController = require('../controllers/api/CommentController');
const MemberApiController = require('../controllers/api/MemberController');

// 公开API接口

// 文章相关API
router.get('/articles', ArticleApiController.list);
router.get('/articles/:id', ArticleApiController.detail);
router.post('/articles/:id/hit', ArticleApiController.hit); // 增加点击量
router.post('/articles/:id/zan', ArticleApiController.zan); // 点赞

// 栏目相关API
router.get('/classtypes', ClasstypeApiController.list);
router.get('/classtypes/:id', ClasstypeApiController.detail);
router.get('/classtypes/:id/articles', ClasstypeApiController.articles);

// 评论相关API
router.get('/comments', CommentApiController.list);
router.post('/comments', CommentApiController.add);
router.post('/comments/:id/zan', CommentApiController.zan);

// 会员相关API
router.post('/member/register', MemberApiController.register);
router.post('/member/login', MemberApiController.login);
router.get('/member/profile', MemberApiController.profile);
router.post('/member/update', MemberApiController.update);

// 其他公共API
router.get('/config', async (req, res) => {
  const { Sysconfig } = require('../models');
  const { getCache, setCache } = require('../utils/helpers');
  
  try {
    // 从缓存获取配置
    let config = await getCache('webconfig');
    
    if (!config) {
      // 从数据库获取配置
      const configs = await Sysconfig.findAll();
      config = {};
      
      configs.forEach(item => {
        let value = item.data;
        
        // 处理特殊字段
        if (item.field === 'web_js' || item.field === 'ueditor_config') {
          value = value; // 保持原样，不进行HTML解码
        }
        
        config[item.field] = value;
      });
      
      // 缓存配置
      await setCache('webconfig', config, 3600);
    }
    
    // 过滤敏感信息
    const publicConfig = {
      web_name: config.web_name || '极致CMS',
      web_title: config.web_title || '',
      web_keywords: config.web_keywords || '',
      web_description: config.web_description || '',
      web_logo: config.web_logo || '',
      web_favicon: config.web_favicon || '',
      copyright: config.copyright || '',
      record: config.record || ''
    };
    
    res.json({
      code: 0,
      msg: 'success',
      data: publicConfig
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({
      code: 1,
      msg: '获取配置失败'
    });
  }
});

module.exports = router;