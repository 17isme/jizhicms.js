const { Article, Classtype, Sysconfig, Links } = require('../../models');
const { JsonReturn, formatTime, buildTree, getCache, setCache } = require('../../utils/helpers');
const { Op } = require('sequelize');

class HomeController {
  // 首页
  static async index(req, res) {
    try {
      // 获取网站配置
      const webConfig = await getWebConfig();
      
      // 获取推荐文章
      const recommendArticles = await Article.findAll({
        where: {
          isshow: 1,
          jzattr: { [Op.like]: '%推荐%' }
        },
        include: [
          {
            model: Classtype,
            as: 'category',
            attributes: ['id', 'title', 'htmlurl']
          }
        ],
        order: [['orders', 'DESC'], ['id', 'DESC']],
        limit: 10
      });

      // 获取最新文章
      const latestArticles = await Article.findAll({
        where: { isshow: 1 },
        include: [
          {
            model: Classtype,
            as: 'category',
            attributes: ['id', 'title', 'htmlurl']
          }
        ],
        order: [['addtime', 'DESC']],
        limit: 12
      });

      // 获取热门文章
      const hotArticles = await Article.findAll({
        where: { isshow: 1 },
        include: [
          {
            model: Classtype,
            as: 'category',
            attributes: ['id', 'title', 'htmlurl']
          }
        ],
        order: [['hits', 'DESC']],
        limit: 10
      });

      // 获取栏目导航
      const navigation = await getNavigation();

      // 获取友情链接
      const friendLinks = await Links.findAll({
        where: { isshow: 1, type: 1 },
        order: [['orders', 'ASC'], ['id', 'DESC']],
        limit: 20
      });

      // 格式化文章数据
      const formatArticles = (articles) => {
        return articles.map(article => ({
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
          addtime: formatTime(article.addtime),
          addtime_format: formatTimeHuman(article.addtime)
        }));
      };

      res.render('frontend/index', {
        title: webConfig.web_title || webConfig.web_name || '极致CMS',
        keywords: webConfig.web_keywords || '',
        description: webConfig.web_description || '',
        webConfig,
        navigation,
        recommendArticles: formatArticles(recommendArticles),
        latestArticles: formatArticles(latestArticles),
        hotArticles: formatArticles(hotArticles),
        friendLinks
      });

    } catch (error) {
      console.error('Home index error:', error);
      res.status(500).render('frontend/error', {
        title: '服务器错误',
        message: '页面加载失败，请稍后重试'
      });
    }
  }

  // 页面详情
  static async page(req, res) {
    try {
      const pageId = parseInt(req.params.id);
      
      if (!pageId) {
        return res.status(404).render('frontend/404', {
          title: '页面未找到'
        });
      }

      // 获取页面信息（这里可以从自定义页面表获取，暂时使用文章表）
      const page = await Article.findOne({
        where: {
          id: pageId,
          isshow: 1,
          molds: 'page' // 假设页面类型为page
        }
      });

      if (!page) {
        return res.status(404).render('frontend/404', {
          title: '页面未找到'
        });
      }

      const webConfig = await getWebConfig();
      const navigation = await getNavigation();

      res.render('frontend/page', {
        title: `${page.title} - ${webConfig.web_name}`,
        keywords: page.keywords || webConfig.web_keywords,
        description: page.description || webConfig.web_description,
        webConfig,
        navigation,
        page: {
          id: page.id,
          title: page.title,
          body: page.body,
          addtime: formatTime(page.addtime)
        }
      });

    } catch (error) {
      console.error('Page detail error:', error);
      res.status(500).render('frontend/error', {
        title: '服务器错误',
        message: '页面加载失败，请稍后重试'
      });
    }
  }

  // 搜索
  static async search(req, res) {
    try {
      const keyword = req.query.q || req.query.keyword || '';
      const page = parseInt(req.query.page) || 1;
      const pageSize = 12;
      const offset = (page - 1) * pageSize;

      if (!keyword.trim()) {
        return res.redirect('/');
      }

      // 搜索文章
      const { count, rows } = await Article.findAndCountAll({
        where: {
          isshow: 1,
          [Op.or]: [
            { title: { [Op.like]: `%${keyword}%` } },
            { keywords: { [Op.like]: `%${keyword}%` } },
            { description: { [Op.like]: `%${keyword}%` } },
            { body: { [Op.like]: `%${keyword}%` } }
          ]
        },
        include: [
          {
            model: Classtype,
            as: 'category',
            attributes: ['id', 'title', 'htmlurl']
          }
        ],
        order: [['addtime', 'DESC']],
        limit: pageSize,
        offset
      });

      const webConfig = await getWebConfig();
      const navigation = await getNavigation();

      // 格式化搜索结果
      const searchResults = rows.map(article => ({
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
        addtime: formatTime(article.addtime),
        addtime_format: formatTimeHuman(article.addtime)
      }));

      // 分页信息
      const totalPages = Math.ceil(count / pageSize);
      const pagination = {
        current: page,
        total: count,
        totalPages,
        pageSize,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };

      res.render('frontend/search', {
        title: `搜索"${keyword}"的结果 - ${webConfig.web_name}`,
        keywords: `${keyword},搜索,${webConfig.web_keywords}`,
        description: `搜索"${keyword}"的相关内容`,
        webConfig,
        navigation,
        keyword,
        searchResults,
        pagination
      });

    } catch (error) {
      console.error('Search error:', error);
      res.status(500).render('frontend/error', {
        title: '搜索失败',
        message: '搜索功能暂时不可用，请稍后重试'
      });
    }
  }

  // RSS订阅
  static async rss(req, res) {
    try {
      const webConfig = await getWebConfig();
      
      // 获取最新文章
      const articles = await Article.findAll({
        where: { isshow: 1 },
        order: [['addtime', 'DESC']],
        limit: 20
      });

      res.set('Content-Type', 'application/rss+xml; charset=utf-8');
      
      let rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${webConfig.web_name || '极致CMS'}]]></title>
    <link>${req.protocol}://${req.get('host')}</link>
    <description><![CDATA[${webConfig.web_description || ''}]]></description>
    <language>zh-CN</language>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <atom:link href="${req.protocol}://${req.get('host')}/rss.xml" rel="self" type="application/rss+xml" />`;

      articles.forEach(article => {
        rssXml += `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${req.protocol}://${req.get('host')}/article/${article.id}.html</link>
      <description><![CDATA[${article.description || ''}]]></description>
      <pubDate>${new Date(article.addtime * 1000).toUTCString()}</pubDate>
      <guid>${req.protocol}://${req.get('host')}/article/${article.id}.html</guid>
    </item>`;
      });

      rssXml += `
  </channel>
</rss>`;

      res.send(rssXml);

    } catch (error) {
      console.error('RSS error:', error);
      res.status(500).send('RSS生成失败');
    }
  }

  // 网站地图
  static async sitemap(req, res) {
    try {
      // 获取所有显示的文章和栏目
      const [articles, classtypes] = await Promise.all([
        Article.findAll({
          where: { isshow: 1 },
          attributes: ['id', 'addtime'],
          order: [['addtime', 'DESC']]
        }),
        Classtype.findAll({
          where: { isshow: 1 },
          attributes: ['id', 'addtime']
        })
      ]);

      res.set('Content-Type', 'application/xml; charset=utf-8');
      
      let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${req.protocol}://${req.get('host')}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

      // 添加栏目链接
      classtypes.forEach(classtype => {
        sitemapXml += `
  <url>
    <loc>${req.protocol}://${req.get('host')}/list/${classtype.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });

      // 添加文章链接
      articles.forEach(article => {
        sitemapXml += `
  <url>
    <loc>${req.protocol}://${req.get('host')}/article/${article.id}.html</loc>
    <lastmod>${new Date(article.addtime * 1000).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });

      sitemapXml += `
</urlset>`;

      res.send(sitemapXml);

    } catch (error) {
      console.error('Sitemap error:', error);
      res.status(500).send('网站地图生成失败');
    }
  }
}

// 获取网站配置
async function getWebConfig() {
  let config = await getCache('webconfig');
  
  if (!config) {
    const configs = await Sysconfig.findAll();
    config = {};
    
    configs.forEach(item => {
      let value = item.data;
      
      // 处理特殊字段
      if (item.field === 'web_js' || item.field === 'ueditor_config') {
        // 保持原样，不进行HTML解码
      }
      
      config[item.field] = value;
    });
    
    // 缓存配置
    await setCache('webconfig', config, 3600);
  }
  
  return config;
}

// 获取导航栏目
async function getNavigation() {
  let navigation = await getCache('navigation');
  
  if (!navigation) {
    const classtypes = await Classtype.findAll({
      where: { isshow: 1 },
      attributes: ['id', 'title', 'pid', 'htmlurl', 'target', 'ownurl'],
      order: [['orders', 'ASC'], ['id', 'ASC']]
    });
    
    // 构建树形导航
    navigation = buildTree(classtypes.map(item => ({
      id: item.id,
      title: item.title,
      pid: item.pid,
      url: item.ownurl || item.htmlurl || `/list/${item.id}`,
      target: item.target || '_self'
    })));
    
    // 缓存导航
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

module.exports = HomeController;