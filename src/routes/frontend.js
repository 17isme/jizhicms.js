const express = require('express');
const router = express.Router();

// 前台控制器
const HomeController = require('../controllers/frontend/HomeController');
const ArticleController = require('../controllers/frontend/ArticleController');
const ClasstypeController = require('../controllers/frontend/ClasstypeController');

// 前台路由

// 首页
router.get('/', HomeController.index);

// 文章详情页
router.get('/article/:id.html', ArticleController.detail);
router.get('/a/:id', ArticleController.detail); // 简短URL

// 栏目页面
router.get('/list/:id', ClasstypeController.list);
router.get('/list/:id/:page', ClasstypeController.list);

// 页面路由
router.get('/page/:id', HomeController.page);

// 搜索
router.get('/search', HomeController.search);

// RSS
router.get('/rss.xml', HomeController.rss);

// 网站地图
router.get('/sitemap.xml', HomeController.sitemap);

module.exports = router;