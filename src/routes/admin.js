const express = require('express');
const router = express.Router();

// 引入管理后台控制器
const LoginController = require('../controllers/admin/LoginController');
const IndexController = require('../controllers/admin/IndexController');
const AdminController = require('../controllers/admin/AdminController');
const ArticleController = require('../controllers/admin/ArticleController');
const ClasstypeController = require('../controllers/admin/ClasstypeController');
const SysController = require('../controllers/admin/SysController');

// 引入中间件
const { adminAuth, checkPermission } = require('../middleware/auth');

// 登录相关路由（无需验证）
router.get('/login', LoginController.showLogin);
router.post('/login', LoginController.login);
router.get('/logout', LoginController.logout);
router.get('/captcha', LoginController.captcha);

// 需要登录验证的路由
router.use(adminAuth);

// 后台首页
router.get('/', IndexController.index);
router.get('/main', IndexController.main);
router.get('/desktop', IndexController.desktop);

// 管理员管理
router.get('/admin/list', checkPermission('admin_list'), AdminController.list);
router.get('/admin/add', checkPermission('admin_add'), AdminController.add);
router.post('/admin/save', checkPermission('admin_add'), AdminController.save);
router.get('/admin/edit/:id', checkPermission('admin_edit'), AdminController.edit);
router.post('/admin/update/:id', checkPermission('admin_edit'), AdminController.update);
router.post('/admin/delete', checkPermission('admin_del'), AdminController.delete);

// 角色组管理
router.get('/admin/group', checkPermission('group_list'), AdminController.group);
router.post('/admin/group/save', checkPermission('group_add'), AdminController.groupSave);
router.post('/admin/group/delete', checkPermission('group_del'), AdminController.groupDelete);

// 文章管理
router.get('/article/list', checkPermission('article_list'), ArticleController.list);
router.get('/article/add', checkPermission('article_add'), ArticleController.add);
router.post('/article/save', checkPermission('article_add'), ArticleController.save);
router.get('/article/edit/:id', checkPermission('article_edit'), ArticleController.edit);
router.post('/article/update/:id', checkPermission('article_edit'), ArticleController.update);
router.post('/article/delete', checkPermission('article_del'), ArticleController.delete);

// 栏目管理
router.get('/classtype/list', checkPermission('classtype_list'), ClasstypeController.list);
router.get('/classtype/add', checkPermission('classtype_add'), ClasstypeController.add);
router.post('/classtype/save', checkPermission('classtype_add'), ClasstypeController.save);
router.get('/classtype/edit/:id', checkPermission('classtype_edit'), ClasstypeController.edit);
router.post('/classtype/update/:id', checkPermission('classtype_edit'), ClasstypeController.update);
router.post('/classtype/delete', checkPermission('classtype_del'), ClasstypeController.delete);

// 系统管理
router.get('/sys/config', checkPermission('sys_config'), SysController.config);
router.post('/sys/config/save', checkPermission('sys_config'), SysController.configSave);
router.get('/sys/cache/clear', checkPermission('sys_cache'), SysController.clearCache);

// API接口路由
router.get('/api/admin/info', AdminController.info);
router.post('/api/upload', checkPermission('upload'), require('../controllers/admin/UploadController').uploadHandler);

module.exports = router;