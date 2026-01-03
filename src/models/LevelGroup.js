const { DataTypes } = require('sequelize');

// 管理员角色组表模型 - 兼容OLD项目的jz_level_group表
module.exports = (sequelize, DB_PREFIX) => {
  const LevelGroup = sequelize.define('LevelGroup', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '角色组ID'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '角色组名称'
    },
    purviews: {
      type: DataTypes.TEXT,
      comment: '权限设置'
    },
    purview_type: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '权限类型'
    },
    purview_name: {
      type: DataTypes.TEXT,
      comment: '权限名称'
    },
    addtime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '添加时间'
    },
    issystem: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否系统角色'
    }
  }, {
    tableName: `${DB_PREFIX}level_group`,
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    engine: 'MyISAM',
    comment: '管理员角色组表'
  });

  return LevelGroup;
};