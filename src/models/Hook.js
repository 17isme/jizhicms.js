const { DataTypes } = require('sequelize');

// 钩子插件表模型 - 兼容OLD项目的jz_hook表
module.exports = (sequelize, DB_PREFIX) => {
  const Hook = sequelize.define('Hook', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '钩子ID'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '钩子名称'
    },
    module: {
      type: DataTypes.STRING(50),
      comment: '所属模块'
    },
    controller: {
      type: DataTypes.STRING(50),
      comment: '控制器'
    },
    action: {
      type: DataTypes.STRING(255),
      comment: '方法'
    },
    all_action: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '全部方法'
    },
    hook_controller: {
      type: DataTypes.STRING(50),
      comment: '钩子控制器'
    },
    hook_action: {
      type: DataTypes.STRING(50),
      comment: '钩子方法'
    },
    isopen: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
      comment: '是否开启'
    },
    orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    addtime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '添加时间'
    }
  }, {
    tableName: `${DB_PREFIX}hook`,
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    engine: 'MyISAM',
    comment: '钩子插件表'
  });

  return Hook;
};