const { DataTypes } = require('sequelize');

// 栏目分类表模型 - 兼容OLD项目的jz_classtype表
module.exports = (sequelize, DB_PREFIX) => {
  const Classtype = sequelize.define('Classtype', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '栏目ID'
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '栏目名称'
    },
    biaoshi: {
      type: DataTypes.STRING(50),
      comment: '栏目标识'
    },
    pid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '父级栏目ID'
    },
    pids: {
      type: DataTypes.STRING(100),
      comment: '所有父级ID'
    },
    orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    keywords: {
      type: DataTypes.STRING(255),
      comment: '关键词'
    },
    description: {
      type: DataTypes.STRING(500),
      comment: '描述'
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
    litpic: {
      type: DataTypes.STRING(255),
      comment: '栏目图片'
    },
    banner: {
      type: DataTypes.STRING(255),
      comment: '栏目横幅'
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
    htmlurl: {
      type: DataTypes.STRING(100),
      comment: '栏目链接'
    },
    ownurl: {
      type: DataTypes.STRING(255),
      comment: '自定义URL'
    },
    template_list: {
      type: DataTypes.STRING(50),
      comment: '列表页模板'
    },
    template_show: {
      type: DataTypes.STRING(50),
      comment: '详情页模板'
    },
    pagesize: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      comment: '每页显示数量'
    },
    addtime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '添加时间'
    }
  }, {
    tableName: `${DB_PREFIX}classtype`,
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    engine: 'MyISAM',
    comment: '栏目分类表'
  });

  return Classtype;
};