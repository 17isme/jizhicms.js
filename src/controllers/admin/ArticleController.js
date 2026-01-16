const { Article, Classtype, Level } = require('../../models');
const { JsonReturn, time, formatParam, getPagination, htmlEncode } = require('../../utils/helpers');
const { Op } = require('sequelize');

class ArticleController {
  // 文章列表
  static async list(req, res) {
    try {
      const page = formatParam(req.query.page, 1, 1);
      const pageSize = formatParam(req.query.limit, 1, 10);
      const keyword = formatParam(req.query.title);
      const tid = formatParam(req.query.tid, 1);
      const isshow = formatParam(req.query.isshow, 1);
      
      const { offset } = getPagination(page, pageSize);
      
      // 构建查询条件
      const where = {};
      
      if (keyword) {
        where.title = { [Op.like]: `%${keyword}%` };
      }
      
      if (tid > 0) {
        where.tid = tid;
      }
      
      if (isshow !== '') {
        where.isshow = isshow;
      }

      const { count, rows } = await Article.findAndCountAll({
        where,
        include: [
          {
            model: Classtype,
            as: 'category',
            attributes: ['id', 'title']
          },
          {
            model: Level,
            as: 'author',
            attributes: ['username', 'name']
          }
        ],
        limit: pageSize,
        offset,
        order: [['orders', 'DESC'], ['id', 'DESC']]
      });

      // 获取栏目列表用于筛选
      const classtypes = await Classtype.findAll({
        where: { molds: 'article' },
        attributes: ['id', 'title'],
        order: [['orders', 'ASC'], ['id', 'ASC']]
      });

      // 格式化数据
      const list = rows.map(article => ({
        id: article.id,
        title: article.title,
        litpic: article.litpic,
        category: article.category ? article.category.title : '未分类',
        author: article.author ? (article.author.name || article.author.username) : '未知',
        hits: article.hits,
        isshow: article.isshow,
        addtime: article.addtime,
        orders: article.orders,
        jzattr: article.jzattr
      }));

      const pagination = getPagination(page, pageSize, count);

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json(JsonReturn({
          code: 0,
          msg: 'success',
          data: {
            list,
            pagination
          }
        }));
      }

      res.render('layouts/admin', {
        title: '文章管理 - 极致CMS管理后台',
        user: req.admin,
        body: await new Promise((resolve) => {
          res.render('admin/article-list', {
            articles: list,
            classtypes,
            pagination,
            query: req.query
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
      console.error('Article list error:', error);
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.json(JsonReturn({
          code: 1,
          msg: '获取文章列表失败'
        }));
      } else {
        res.status(500).send('服务器错误');
      }
    }
  }

  // 添加文章页面
  static async add(req, res) {
    try {
      // 获取栏目列表
      const classtypes = await Classtype.findAll({
        where: { molds: 'article' },
        attributes: ['id', 'title', 'pid'],
        order: [['orders', 'ASC'], ['id', 'ASC']]
      });

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json(JsonReturn({
          code: 0,
          msg: 'success',
          data: {
            classtypes
          }
        }));
      }

      res.render('layouts/admin', {
        title: '发布文章 - 极致CMS管理后台',
        user: req.admin,
        body: await new Promise((resolve) => {
          res.render('admin/article-add', {
            classtypes
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
      console.error('Article add error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取数据失败'
      }));
    }
  }

  // 保存文章
  static async save(req, res) {
    try {
      const { 
        title, tid, tids, keywords, description, body, 
        litpic, isshow, orders, target, ownurl, jzattr, tags 
      } = req.body;

      if (!title) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章标题不能为空'
        }));
      }

      const articleData = {
        title: htmlEncode(title),
        tid: formatParam(tid, 1, 0),
        tids: tids || '',
        keywords: keywords || '',
        description: description || '',
        body: body || '',
        litpic: litpic || '',
        molds: 'article',
        userid: req.admin.id,
        orders: formatParam(orders, 1, 0),
        isshow: formatParam(isshow, 1, 1),
        target: target || '',
        ownurl: ownurl || '',
        jzattr: jzattr || '',
        tags: tags || '',
        addtime: time()
      };

      const newArticle = await Article.create(articleData);

      res.json(JsonReturn({
        code: 0,
        msg: '添加成功',
        data: { id: newArticle.id }
      }));

    } catch (error) {
      console.error('Article save error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '添加失败'
      }));
    }
  }

  // 编辑文章
  static async edit(req, res) {
    try {
      const id = formatParam(req.params.id, 1);
      
      const article = await Article.findByPk(id, {
        include: [
          {
            model: Classtype,
            as: 'category'
          }
        ]
      });

      if (!article) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章不存在'
        }));
      }

      // 获取栏目列表
      const classtypes = await Classtype.findAll({
        where: { molds: 'article' },
        attributes: ['id', 'title', 'pid'],
        order: [['orders', 'ASC'], ['id', 'ASC']]
      });

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json(JsonReturn({
          code: 0,
          msg: 'success',
          data: {
            article,
            classtypes
          }
        }));
      }

      res.render('layouts/admin', {
        title: '编辑文章 - 极致CMS管理后台',
        user: req.admin,
        body: await new Promise((resolve) => {
          res.render('admin/article-edit', {
            article,
            classtypes
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
      console.error('Article edit error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取文章信息失败'
      }));
    }
  }

  // 更新文章
  static async update(req, res) {
    try {
      const id = formatParam(req.params.id, 1);
      const { 
        title, tid, tids, keywords, description, body, 
        litpic, isshow, orders, target, ownurl, jzattr, tags 
      } = req.body;

      const article = await Article.findByPk(id);
      if (!article) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章不存在'
        }));
      }

      if (!title) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章标题不能为空'
        }));
      }

      const updateData = {
        title: htmlEncode(title),
        tid: formatParam(tid, 1, 0),
        tids: tids || '',
        keywords: keywords || '',
        description: description || '',
        body: body || '',
        litpic: litpic || '',
        orders: formatParam(orders, 1, 0),
        isshow: formatParam(isshow, 1, 1),
        target: target || '',
        ownurl: ownurl || '',
        jzattr: jzattr || '',
        tags: tags || ''
      };

      await article.update(updateData);

      res.json(JsonReturn({
        code: 0,
        msg: '更新成功'
      }));

    } catch (error) {
      console.error('Article update error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '更新失败'
      }));
    }
  }

  // 删除文章
  static async delete(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.json(JsonReturn({
          code: 1,
          msg: '请选择要删除的文章'
        }));
      }

      await Article.destroy({
        where: {
          id: { [Op.in]: ids }
        }
      });

      res.json(JsonReturn({
        code: 0,
        msg: '删除成功'
      }));

    } catch (error) {
      console.error('Article delete error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '删除失败'
      }));
    }
  }
}

module.exports = ArticleController;