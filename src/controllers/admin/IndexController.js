const { Article, Classtype, Level, Member } = require('../../models');
const { JsonReturn, formatTime } = require('../../utils/helpers');

class IndexController {
  // 后台首页
  static async index(req, res) {
    try {
      // 如果是API请求，返回JSON数据
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return this.main(req, res);
      }

      // 渲染后台首页模板
      res.render('layouts/admin', {
        title: '控制台 - 极致CMS管理后台',
        user: req.admin,
        body: await new Promise((resolve) => {
          res.render('admin/index', {
            user: req.admin
          }, (err, html) => {
            if (err) {
              console.error('Render error:', err);
              resolve('<div class="alert alert-danger">页面渲染失败</div>');
            } else {
              resolve(html);
            }
          });
        })
      });
    } catch (error) {
      console.error('Index error:', error);
      res.status(500).send('服务器错误');
    }
  }

  // 获取首页统计数据
  static async main(req, res) {
    try {
      // 获取统计数据
      const [articleCount, classtypeCount, memberCount, adminCount] = await Promise.all([
        Article.count(),
        Classtype.count(),
        Member.count(),
        Level.count()
      ]);

      // 获取最新文章
      const latestArticles = await Article.findAll({
        limit: 10,
        order: [['addtime', 'DESC']],
        include: [
          {
            model: Classtype,
            as: 'category',
            attributes: ['title']
          }
        ]
      });

      // 格式化文章数据
      const articles = latestArticles.map(article => ({
        id: article.id,
        title: article.title,
        category: article.category ? article.category.title : '未分类',
        addtime: formatTime(article.addtime),
        hits: article.hits,
        isshow: article.isshow
      }));

      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: {
          articleCount,
          classtypeCount,
          memberCount,
          adminCount,
          latestArticles: articles,
          systemInfo: {
            nodejs: process.version,
            platform: process.platform,
            uptime: Math.floor(process.uptime())
          }
        }
      }));

    } catch (error) {
      console.error('Main data error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取数据失败'
      }));
    }
  }

  // 桌面信息
  static async desktop(req, res) {
    try {
      const admin = req.admin;
      
      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: {
          admin: {
            username: admin.username,
            name: admin.name,
            login_time: formatTime(admin.login_time),
            login_num: admin.login_num,
            isadmin: admin.isadmin
          },
          server: {
            nodejs: process.version,
            platform: process.platform,
            arch: process.arch,
            memory: process.memoryUsage(),
            uptime: process.uptime()
          }
        }
      }));
    } catch (error) {
      console.error('Desktop error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取桌面信息失败'
      }));
    }
  }
}

module.exports = IndexController;