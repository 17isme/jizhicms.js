const sequelize = require('../config/database');
const { DB_PREFIX } = require('../config/database');

// 导入所有模型
const Level = require('./Level')(sequelize, DB_PREFIX);
const LevelGroup = require('./LevelGroup')(sequelize, DB_PREFIX);
const Article = require('./Article')(sequelize, DB_PREFIX);
const Classtype = require('./Classtype')(sequelize, DB_PREFIX);
const Sysconfig = require('./Sysconfig')(sequelize, DB_PREFIX);
const Fields = require('./Fields')(sequelize, DB_PREFIX);
const Molds = require('./Molds')(sequelize, DB_PREFIX);
const Member = require('./Member')(sequelize, DB_PREFIX);
const Comment = require('./Comment')(sequelize, DB_PREFIX);
const Links = require('./Links')(sequelize, DB_PREFIX);
const Hook = require('./Hook')(sequelize, DB_PREFIX);

// 定义关联关系
// 管理员与角色组的关系
Level.belongsTo(LevelGroup, { foreignKey: 'gid', as: 'group' });
LevelGroup.hasMany(Level, { foreignKey: 'gid', as: 'users' });

// 文章与栏目的关系
Article.belongsTo(Classtype, { foreignKey: 'tid', as: 'category' });
Classtype.hasMany(Article, { foreignKey: 'tid', as: 'articles' });

// 文章与管理员的关系
Article.belongsTo(Level, { foreignKey: 'userid', as: 'author' });
Level.hasMany(Article, { foreignKey: 'userid', as: 'articles' });

// 字段与模型的关系
Fields.belongsTo(Molds, { foreignKey: 'molds', targetKey: 'biaoshi', as: 'mold' });
Molds.hasMany(Fields, { foreignKey: 'molds', sourceKey: 'biaoshi', as: 'fields' });

// 评论与文章的关系
Comment.belongsTo(Article, { foreignKey: 'aid', as: 'article' });
Article.hasMany(Comment, { foreignKey: 'aid', as: 'comments' });

// 导出所有模型
module.exports = {
  sequelize,
  Level,
  LevelGroup,
  Article,
  Classtype,
  Sysconfig,
  Fields,
  Molds,
  Member,
  Comment,
  Links,
  Hook
};