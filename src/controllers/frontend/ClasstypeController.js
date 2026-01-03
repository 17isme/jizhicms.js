const { Article, Classtype } = require('../../models');
const { JsonReturn, formatTime, getPagination } = require('../../utils/helpers');
const { Op } = require('sequelize');

class ClasstypeController {
  // 栏目列表页
  static async list(req, res) {
    try {
      const categoryId = parseInt(req.params.id);
      const page = parseInt(req.params.page) || parseInt(req.query.page) || 1;
      
      if (!categoryId) {
        return res.status(404).render('frontend/404', {
          title: '栏目未找到'
        });
      }

      // 获取栏目信息
      const category = await Classtype.findOne({
        where: {
          id: categoryId,
          isshow: 1
        }
      });

      if (!category) {
        return res.status(404).render('frontend/404', {
          title: '栏目未找到'
        });
      }

      // 获取网站配置
      const webConfig = await getWebConfig();
      const navigation = await getNavigation();

      // 获取子栏目
      const subCategories = await Classtype.findAll({
        where: {
          pid: categoryId,
          isshow: 1
        },
        attributes: ['id', 'title', 'description', 'litpic', 'htmlurl'],
        order: [['orders', 'ASC'], ['id', 'ASC']]
      });

      // 分页设置
      const pageSize = category.pagesize || 12;
      const { offset } = getPagination(page, pageSize);

      // 获取当前栏目及其子栏目的所有ID
      const categoryIds = [categoryId];
      const allSubCategories = await getSubCategoryIds(categoryId);
      categoryIds.push(...allSubCategories);

      // 构建查询条件
      const where = {
        isshow: 1,
        [Op.or]: [
          { tid: { [Op.in]: categoryIds } },
          { tids: { [Op.like]: `%,${categoryId},%` } }
        ]
      };

      // 获取文章列表
      const { count, rows } = await Article.findAndCountAll({
        where,
        include: [
          {
            model: Classtype,
            as: 'category',
            attributes: ['id', 'title', 'htmlurl']
          }
        ],
        order: [['orders', 'DESC'], ['addtime', 'DESC']],
        limit: pageSize,
        offset
      });

      // 获取推荐文章
      const recommendArticles = await Article.findAll({
        where: {
          ...where,
          jzattr: { [Op.like]: '%推荐%' }
        },
        include: [
          {
            model: Classtype,
            as: 'category',
            attributes: ['id', 'title', 'htmlurl']
          }
        ],
        order: [['orders', 'DESC'], ['addtime', 'DESC']],
        limit: 6
      });

      // 构建面包屑导航
      const breadcrumb = await getCategoryPath(categoryId);

      // 分页信息
      const totalPages = Math.ceil(count / pageSize);
      const pagination = {
        current: page,
        total: count,
        totalPages,
        pageSize,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        baseUrl: `/list/${categoryId}`
      };

      // 格式化文章数据
      const articles = rows.map(article => ({
        id: article.id,
        title: article.title,
        description: article.description || '',
        litpic: article.litpic || '',
        category: article.category ? {
          id: article.category.id,
          title: article.category.title,
          url: article.category.htmlurl || `/list/${article.category.id}`
        } : null,
        url: article.ownurl || `/article/${article.id}.html`,
        hits: article.hits || 0,
        zan: article.zan || 0,
        addtime: formatTime(article.addtime),
        addtime_format: formatTimeHuman(article.addtime),
        jzattr: article.jzattr ? article.jzattr.split(',').filter(attr => attr.trim()) : []
      }));

      // 格式化推荐文章
      const recommendData = recommendArticles.map(article => ({
        id: article.id,
        title: article.title,
        litpic: article.litpic || '',
        url: article.ownurl || `/article/${article.id}.html`,
        hits: article.hits || 0,
        addtime_format: formatTimeHuman(article.addtime)
      }));

      // 格式化子栏目
      const subCategoryData = subCategories.map(sub => ({
        id: sub.id,
        title: sub.title,
        description: sub.description || '',
        litpic: sub.litpic || '',
        url: sub.htmlurl || `/list/${sub.id}`
      }));

      // 栏目数据
      const categoryData = {
        id: category.id,
        title: category.title,
        keywords: category.keywords,
        description: category.description,
        body: category.body,
        litpic: category.litpic,
        banner: category.banner,
        template_list: category.template_list,
        template_show: category.template_show
      };

      // 选择模板
      let template = 'frontend/category';
      if (category.template_list && category.template_list !== '') {
        template = `frontend/${category.template_list}`;
      }

      res.render(template, {
        title: `${category.title} - ${webConfig.web_name}`,
        keywords: category.keywords || webConfig.web_keywords,
        description: category.description || webConfig.web_description,
        webConfig,
        navigation,
        breadcrumb,
        category: categoryData,
        subCategories: subCategoryData,
        articles,
        recommendArticles: recommendData,
        pagination
      });

    } catch (error) {
      console.error('Category list error:', error);
      res.status(500).render('frontend/error', {
        title: '服务器错误',
        message: '栏目页面加载失败，请稍后重试'
      });
    }
  }
}

// 获取所有子栏目ID
async function getSubCategoryIds(categoryId) {
  const subCategories = await Classtype.findAll({
    where: { pid: categoryId },
    attributes: ['id']
  });
  
  let allIds = [];
  
  for (let sub of subCategories) {
    allIds.push(sub.id);
    // 递归获取子栏目的子栏目
    const subSubIds = await getSubCategoryIds(sub.id);
    allIds.push(...subSubIds);
  }
  
  return allIds;
}

// 获取栏目路径
async function getCategoryPath(categoryId) {
  const category = await Classtype.findByPk(categoryId, {
    attributes: ['id', 'title', 'pid', 'htmlurl']
  });
  
  if (!category) return [];
  
  const path = [];
  
  // 递归获取父级栏目
  if (category.pid && category.pid !== 0) {
    const parentPath = await getCategoryPath(category.pid);
    path.push(...parentPath);
  }
  
  path.push({
    title: category.title,
    url: category.htmlurl || `/list/${category.id}`
  });
  
  return path;
}

// 获取网站配置
async function getWebConfig() {
  const { getCache, setCache } = require('../../utils/helpers');
  const { Sysconfig } = require('../../models');
  
  let config = await getCache('webconfig');
  
  if (!config) {
    const configs = await Sysconfig.findAll();
    config = {};
    
    configs.forEach(item => {
      config[item.field] = item.data;
    });
    
    await setCache('webconfig', config, 3600);
  }
  
  return config;
}

// 获取导航
async function getNavigation() {
  const { getCache, setCache, buildTree } = require('../../utils/helpers');
  const { Classtype } = require('../../models');
  
  let navigation = await getCache('navigation');
  
  if (!navigation) {
    const classtypes = await Classtype.findAll({
      where: { isshow: 1 },
      attributes: ['id', 'title', 'pid', 'htmlurl', 'target', 'ownurl'],
      order: [['orders', 'ASC'], ['id', 'ASC']]
    });
    
    navigation = buildTree(classtypes.map(item => ({
      id: item.id,
      title: item.title,
      pid: item.pid,
      url: item.ownurl || item.htmlurl || `/list/${item.id}`,
      target: item.target || '_self'
    })));
    
    await setCache('navigation', navigation, 3600);
  }
  
  return navigation;
}

// 人性化时间显示
function formatTimeHuman(timestamp) {
  if (!timestamp) return '';
  
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 60) {
    return '刚刚';
  } else if (diff < 3600) {
    return Math.floor(diff / 60) + '分钟前';
  } else if (diff < 86400) {
    return Math.floor(diff / 3600) + '小时前';
  } else if (diff < 604800) {
    return Math.floor(diff / 86400) + '天前';
  } else {
    const date = new Date(timestamp * 1000);
    return `${date.getMonth() + 1}-${date.getDate()}`;
  }
}

module.exports = ClasstypeController;