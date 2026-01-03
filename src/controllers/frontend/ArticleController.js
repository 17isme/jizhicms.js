const { Article, Classtype, Comment, Member } = require('../../models');
const { JsonReturn, formatTime, htmlDecode } = require('../../utils/helpers');
const { Op } = require('sequelize');

class ArticleController {
  // 文章详情页
  static async detail(req, res) {
    try {
      const articleId = parseInt(req.params.id);
      
      if (!articleId) {
        return res.status(404).render('frontend/404', {
          title: '文章未找到'
        });
      }

      // 获取文章详情
      const article = await Article.findOne({
        where: {
          id: articleId,
          isshow: 1
        },
        include: [
          {
            model: Classtype,
            as: 'category',
            attributes: ['id', 'title', 'htmlurl', 'pid']
          }
        ]
      });

      if (!article) {
        return res.status(404).render('frontend/404', {
          title: '文章未找到'
        });
      }

      // 增加点击量
      await article.increment('hits');

      // 获取网站配置
      const webConfig = await getWebConfig();
      const navigation = await getNavigation();

      // 获取相关文章
      const relatedArticles = await Article.findAll({
        where: {
          id: { [Op.ne]: articleId },
          tid: article.tid,
          isshow: 1
        },
        attributes: ['id', 'title', 'litpic', 'addtime', 'hits'],
        order: [['addtime', 'DESC']],
        limit: 6
      });

      // 获取上一篇和下一篇文章
      const [prevArticle, nextArticle] = await Promise.all([
        Article.findOne({
          where: {
            id: { [Op.lt]: articleId },
            tid: article.tid,
            isshow: 1
          },
          attributes: ['id', 'title'],
          order: [['id', 'DESC']]
        }),
        Article.findOne({
          where: {
            id: { [Op.gt]: articleId },
            tid: article.tid,
            isshow: 1
          },
          attributes: ['id', 'title'],
          order: [['id', 'ASC']]
        })
      ]);

      // 获取评论列表
      const comments = await Comment.findAll({
        where: {
          aid: articleId,
          isshow: 1,
          pid: 0 // 只获取主评论
        },
        include: [
          {
            model: Member,
            as: 'member',
            attributes: ['nickname', 'face'],
            required: false
          }
        ],
        order: [['addtime', 'DESC']],
        limit: 20
      });

      // 获取每个主评论的回复
      for (let comment of comments) {
        const replies = await Comment.findAll({
          where: {
            aid: articleId,
            pid: comment.id,
            isshow: 1
          },
          include: [
            {
              model: Member,
              as: 'member',
              attributes: ['nickname', 'face'],
              required: false
            }
          ],
          order: [['addtime', 'ASC']],
          limit: 10
        });
        comment.replies = replies;
      }

      // 构建面包屑导航
      const breadcrumb = [];
      if (article.category) {
        // 获取栏目的父级路径
        const categoryPath = await getCategoryPath(article.category.id);
        breadcrumb.push(...categoryPath);
      }
      breadcrumb.push({ title: article.title, url: '' });

      // 格式化文章数据
      const articleData = {
        id: article.id,
        title: article.title,
        keywords: article.keywords,
        description: article.description,
        body: htmlDecode(article.body),
        litpic: article.litpic,
        hits: article.hits + 1, // 显示增加后的点击量
        zan: article.zan || 0,
        tags: article.tags ? article.tags.split(',').filter(tag => tag.trim()) : [],
        addtime: formatTime(article.addtime),
        addtime_format: formatTimeHuman(article.addtime),
        category: article.category ? {
          id: article.category.id,
          title: article.category.title,
          url: article.category.htmlurl || `/list/${article.category.id}`
        } : null
      };

      // 格式化相关文章
      const relatedData = relatedArticles.map(item => ({
        id: item.id,
        title: item.title,
        litpic: item.litpic,
        url: `/article/${item.id}.html`,
        hits: item.hits,
        addtime_format: formatTimeHuman(item.addtime)
      }));

      // 格式化评论数据
      const commentsData = comments.map(comment => ({
        id: comment.id,
        nickname: comment.nickname || (comment.member ? comment.member.nickname : '匿名用户'),
        face: comment.face || (comment.member ? comment.member.face : ''),
        content: comment.content,
        addtime: formatTime(comment.addtime),
        addtime_format: formatTimeHuman(comment.addtime),
        zan: comment.zan || 0,
        replies: comment.replies ? comment.replies.map(reply => ({
          id: reply.id,
          nickname: reply.nickname || (reply.member ? reply.member.nickname : '匿名用户'),
          face: reply.face || (reply.member ? reply.member.face : ''),
          content: reply.content,
          addtime_format: formatTimeHuman(reply.addtime)
        })) : []
      }));

      res.render('frontend/article', {
        title: `${article.title} - ${webConfig.web_name}`,
        keywords: article.keywords || webConfig.web_keywords,
        description: article.description || webConfig.web_description,
        webConfig,
        navigation,
        breadcrumb,
        article: articleData,
        relatedArticles: relatedData,
        prevArticle: prevArticle ? {
          id: prevArticle.id,
          title: prevArticle.title,
          url: `/article/${prevArticle.id}.html`
        } : null,
        nextArticle: nextArticle ? {
          id: nextArticle.id,
          title: nextArticle.title,
          url: `/article/${nextArticle.id}.html`
        } : null,
        comments: commentsData
      });

    } catch (error) {
      console.error('Article detail error:', error);
      res.status(500).render('frontend/error', {
        title: '服务器错误',
        message: '文章加载失败，请稍后重试'
      });
    }
  }
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

// 获取网站配置 (复用HomeController中的函数)
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

// 获取导航 (复用HomeController中的函数)
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

module.exports = ArticleController;