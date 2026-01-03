const { Article, Classtype, Level } = require('../../models');
const { JsonReturn, formatTime, getPagination } = require('../../utils/helpers');
const { Op } = require('sequelize');

class ArticleApiController {
  // 获取文章列表
  static async list(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 50); // 限制最大50条
      const keyword = req.query.keyword || '';
      const tid = parseInt(req.query.tid) || 0;
      const jzattr = req.query.jzattr || '';
      
      const { offset } = getPagination(page, pageSize);
      
      // 构建查询条件
      const where = { isshow: 1 };
      
      if (keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${keyword}%` } },
          { keywords: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } }
        ];
      }
      
      if (tid > 0) {
        where[Op.or] = [
          { tid },
          { tids: { [Op.like]: `%,${tid},%` } }
        ];
      }
      
      if (jzattr) {
        where.jzattr = { [Op.like]: `%${jzattr}%` };
      }

      const { count, rows } = await Article.findAndCountAll({
        where,
        include: [
          {
            model: Classtype,
            as: 'category',
            attributes: ['id', 'title', 'htmlurl']
          },
          {
            model: Level,
            as: 'author',
            attributes: ['username', 'name'],
            required: false
          }
        ],
        attributes: [
          'id', 'title', 'description', 'litpic', 'keywords', 
          'hits', 'zan', 'jzattr', 'tags', 'addtime', 'ownurl'
        ],
        order: [['orders', 'DESC'], ['addtime', 'DESC']],
        limit: pageSize,
        offset
      });

      // 格式化数据
      const articles = rows.map(article => ({
        id: article.id,
        title: article.title,
        description: article.description || '',
        litpic: article.litpic || '',
        keywords: article.keywords || '',
        hits: article.hits || 0,
        zan: article.zan || 0,
        jzattr: article.jzattr ? article.jzattr.split(',').filter(attr => attr.trim()) : [],
        tags: article.tags ? article.tags.split(',').filter(tag => tag.trim()) : [],
        addtime: formatTime(article.addtime),
        addtime_timestamp: article.addtime,
        url: article.ownurl || `/article/${article.id}.html`,
        category: article.category ? {
          id: article.category.id,
          title: article.category.title,
          url: article.category.htmlurl || `/list/${article.category.id}`
        } : null,
        author: article.author ? (article.author.name || article.author.username) : null
      }));

      const pagination = getPagination(page, pageSize, count);

      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: {
          articles,
          pagination
        }
      }));

    } catch (error) {
      console.error('Article API list error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取文章列表失败'
      }));
    }
  }

  // 获取文章详情
  static async detail(req, res) {
    try {
      const articleId = parseInt(req.params.id);
      
      if (!articleId) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章ID无效'
        }));
      }

      const article = await Article.findOne({
        where: {
          id: articleId,
          isshow: 1
        },
        include: [
          {
            model: Classtype,
            as: 'category',
            attributes: ['id', 'title', 'htmlurl']
          },
          {
            model: Level,
            as: 'author',
            attributes: ['username', 'name'],
            required: false
          }
        ]
      });

      if (!article) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章不存在'
        }));
      }

      // 格式化文章数据
      const articleData = {
        id: article.id,
        title: article.title,
        description: article.description || '',
        body: article.body || '',
        litpic: article.litpic || '',
        keywords: article.keywords || '',
        hits: article.hits || 0,
        zan: article.zan || 0,
        jzattr: article.jzattr ? article.jzattr.split(',').filter(attr => attr.trim()) : [],
        tags: article.tags ? article.tags.split(',').filter(tag => tag.trim()) : [],
        addtime: formatTime(article.addtime),
        addtime_timestamp: article.addtime,
        url: article.ownurl || `/article/${article.id}.html`,
        category: article.category ? {
          id: article.category.id,
          title: article.category.title,
          url: article.category.htmlurl || `/list/${article.category.id}`
        } : null,
        author: article.author ? (article.author.name || article.author.username) : null
      };

      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: articleData
      }));

    } catch (error) {
      console.error('Article API detail error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取文章详情失败'
      }));
    }
  }

  // 增加点击量
  static async hit(req, res) {
    try {
      const articleId = parseInt(req.params.id);
      
      if (!articleId) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章ID无效'
        }));
      }

      const article = await Article.findOne({
        where: {
          id: articleId,
          isshow: 1
        },
        attributes: ['id', 'hits']
      });

      if (!article) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章不存在'
        }));
      }

      // 增加点击量
      await article.increment('hits');

      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: {
          hits: article.hits + 1
        }
      }));

    } catch (error) {
      console.error('Article API hit error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '操作失败'
      }));
    }
  }

  // 点赞
  static async zan(req, res) {
    try {
      const articleId = parseInt(req.params.id);
      
      if (!articleId) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章ID无效'
        }));
      }

      const article = await Article.findOne({
        where: {
          id: articleId,
          isshow: 1
        },
        attributes: ['id', 'zan']
      });

      if (!article) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章不存在'
        }));
      }

      // 增加点赞数
      await article.increment('zan');

      res.json(JsonReturn({
        code: 0,
        msg: '点赞成功',
        data: {
          zan: article.zan + 1
        }
      }));

    } catch (error) {
      console.error('Article API zan error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '操作失败'
      }));
    }
  }
}

module.exports = ArticleApiController;