const { Classtype, Article } = require('../../models');
const { JsonReturn, buildTree, getPagination } = require('../../utils/helpers');
const { Op } = require('sequelize');

class ClasstypeApiController {
  // 获取栏目列表
  static async list(req, res) {
    try {
      const tree = req.query.tree === 'true' || req.query.tree === '1';
      const pid = parseInt(req.query.pid) || 0;
      const molds = req.query.molds || '';
      
      // 构建查询条件
      const where = { isshow: 1 };
      
      if (!tree && pid >= 0) {
        where.pid = pid;
      }
      
      if (molds) {
        where.molds = molds;
      }

      const classtypes = await Classtype.findAll({
        where,
        attributes: [
          'id', 'title', 'pid', 'description', 'litpic', 'banner',
          'htmlurl', 'ownurl', 'target', 'molds', 'orders', 'pagesize'
        ],
        order: [['orders', 'ASC'], ['id', 'ASC']]
      });

      // 格式化数据
      let data = classtypes.map(classtype => ({
        id: classtype.id,
        title: classtype.title,
        pid: classtype.pid,
        description: classtype.description || '',
        litpic: classtype.litpic || '',
        banner: classtype.banner || '',
        url: classtype.ownurl || classtype.htmlurl || `/list/${classtype.id}`,
        target: classtype.target || '_self',
        molds: classtype.molds,
        orders: classtype.orders,
        pagesize: classtype.pagesize || 10
      }));

      // 如果需要树形结构
      if (tree) {
        data = buildTree(data);
      }

      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: {
          classtypes: data
        }
      }));

    } catch (error) {
      console.error('Classtype API list error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取栏目列表失败'
      }));
    }
  }

  // 获取栏目详情
  static async detail(req, res) {
    try {
      const classtypeId = parseInt(req.params.id);
      
      if (!classtypeId) {
        return res.json(JsonReturn({
          code: 1,
          msg: '栏目ID无效'
        }));
      }

      const classtype = await Classtype.findOne({
        where: {
          id: classtypeId,
          isshow: 1
        }
      });

      if (!classtype) {
        return res.json(JsonReturn({
          code: 1,
          msg: '栏目不存在'
        }));
      }

      // 获取子栏目
      const subClasstypes = await Classtype.findAll({
        where: {
          pid: classtypeId,
          isshow: 1
        },
        attributes: ['id', 'title', 'description', 'litpic', 'htmlurl', 'ownurl'],
        order: [['orders', 'ASC'], ['id', 'ASC']]
      });

      // 获取栏目文章数量
      const articleCount = await Article.count({
        where: {
          [Op.or]: [
            { tid: classtypeId },
            { tids: { [Op.like]: `%,${classtypeId},%` } }
          ],
          isshow: 1
        }
      });

      // 格式化栏目数据
      const classtypeData = {
        id: classtype.id,
        title: classtype.title,
        biaoshi: classtype.biaoshi,
        pid: classtype.pid,
        pids: classtype.pids,
        description: classtype.description || '',
        body: classtype.body || '',
        litpic: classtype.litpic || '',
        banner: classtype.banner || '',
        url: classtype.ownurl || classtype.htmlurl || `/list/${classtype.id}`,
        target: classtype.target || '_self',
        molds: classtype.molds,
        keywords: classtype.keywords || '',
        template_list: classtype.template_list || '',
        template_show: classtype.template_show || '',
        pagesize: classtype.pagesize || 10,
        orders: classtype.orders,
        articleCount,
        subClasstypes: subClasstypes.map(sub => ({
          id: sub.id,
          title: sub.title,
          description: sub.description || '',
          litpic: sub.litpic || '',
          url: sub.ownurl || sub.htmlurl || `/list/${sub.id}`
        }))
      };

      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: classtypeData
      }));

    } catch (error) {
      console.error('Classtype API detail error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取栏目详情失败'
      }));
    }
  }

  // 获取栏目下的文章
  static async articles(req, res) {
    try {
      const classtypeId = parseInt(req.params.id);
      const page = parseInt(req.query.page) || 1;
      const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 50);
      const jzattr = req.query.jzattr || '';
      
      if (!classtypeId) {
        return res.json(JsonReturn({
          code: 1,
          msg: '栏目ID无效'
        }));
      }

      // 验证栏目是否存在
      const classtype = await Classtype.findOne({
        where: {
          id: classtypeId,
          isshow: 1
        },
        attributes: ['id', 'title', 'pagesize']
      });

      if (!classtype) {
        return res.json(JsonReturn({
          code: 1,
          msg: '栏目不存在'
        }));
      }

      const { offset } = getPagination(page, pageSize);
      
      // 构建查询条件
      const where = {
        [Op.or]: [
          { tid: classtypeId },
          { tids: { [Op.like]: `%,${classtypeId},%` } }
        ],
        isshow: 1
      };
      
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

      // 格式化文章数据
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
        addtime: article.addtime,
        url: article.ownurl || `/article/${article.id}.html`,
        category: article.category ? {
          id: article.category.id,
          title: article.category.title,
          url: article.category.htmlurl || `/list/${article.category.id}`
        } : null
      }));

      const pagination = getPagination(page, pageSize, count);

      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: {
          classtype: {
            id: classtype.id,
            title: classtype.title
          },
          articles,
          pagination
        }
      }));

    } catch (error) {
      console.error('Classtype API articles error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取栏目文章失败'
      }));
    }
  }
}

module.exports = ClasstypeApiController;