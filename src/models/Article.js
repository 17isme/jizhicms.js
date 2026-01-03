const { DataTypes } = require('sequelize');

// 文章表模型 - 兼容OLD项目的jz_article表
module.exports = (sequelize, DB_PREFIX) => {
  const Article = sequelize.define('Article', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '文章ID'
    },
    tid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '所属栏目'
    },
    tids: {
      type: DataTypes.STRING(255),
      comment: '副栏目'
    },
    title: {
      type: DataTypes.STRING(255),
      comment: '标题'
    },
    litpic: {
      type: DataTypes.STRING(255),
      comment: '缩略图'
    },
    keywords: {
      type: DataTypes.STRING(255),
      comment: '关键词'
    },
    description: {
      type: DataTypes.STRING(500),
      comment: '简介'
    },
    body: {
      type: DataTypes.TEXT,
      comment: '内容'
    },
    molds: {
      type: DataTypes.STRING(50),
      defaultValue: 'article',
      comment: '模型标识'
    },
    userid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '发布管理员'
    },
    orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    member_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '前台用户'
    },
    comment_num: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '评论数'
    },
    htmlurl: {
      type: DataTypes.STRING(100),
      comment: '栏目链接'
    },
    isshow: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
      comment: '是否显示'
    },
    target: {
      type: DataTypes.STRING(255),
      comment: '外链'
    },
    ownurl: {
      type: DataTypes.STRING(255),
      comment: '自定义URL'
    },
    jzattr: {
      type: DataTypes.STRING(50),
      comment: '推荐属性'
    },
    hits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '点击量'
    },
    zan: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '点赞数'
    },
    tags: {
      type: DataTypes.STRING(255),
      comment: 'TAG'
    },
    addtime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '发布时间'
    }
  }, {
    tableName: `${DB_PREFIX}article`,
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    engine: 'MyISAM',
    comment: '文章表'
  });

  return Article;
};