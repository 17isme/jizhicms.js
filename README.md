# 极致CMS Node.js版本

基于Node.js + Express + Sequelize + MySQL开发的CMS内容管理系统，完全兼容极致CMS PHP版本的数据库结构。

## 🌟 项目特色

- ✅ **完全兼容**：与极致CMS PHP版本数据库结构100%兼容
- 🚀 **高性能**：基于Node.js异步I/O，性能卓越  
- 🔒 **安全可靠**：JWT + Session双重认证，权限控制完善
- 🎯 **易于扩展**：模块化设计，支持插件开发
- 📱 **响应式**：支持PC和移动端自适应
- 🌍 **国际化**：支持多语言切换

## 🛠 技术栈

- **后端框架**: Express.js
- **数据库ORM**: Sequelize  
- **数据库**: MySQL 5.7+
- **缓存**: Redis
- **认证**: JWT + Session
- **文件上传**: Multer
- **模板引擎**: EJS
- **进程管理**: PM2

## 📋 系统要求

- Node.js 14.0+
- MySQL 5.7+
- Redis 3.0+
- 内存 2GB+

## 🚀 快速开始

### 1. 克隆项目
\`\`\`bash
git clone <项目地址>
cd nodejs-cms
\`\`\`

### 2. 安装依赖
\`\`\`bash
npm install
\`\`\`

### 3. 配置环境变量
复制 \`.env.example\` 到 \`.env\` 并修改配置：

\`\`\`env
# 数据库配置 (使用OLD项目的数据库)
DB_HOST=mysql57.rdsmd5ukjsfwfvo.rds.su.baidubce.com
DB_NAME=gzfnet
DB_USER=gzfnet
DB_PASS=FXMyhQMyei!
DB_PORT=3306
DB_PREFIX=jz_

# 应用配置
NODE_ENV=development
PORT=3000
APP_SECRET=your-secret-key-here

# Redis配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
\`\`\`

### 4. 启动服务
\`\`\`bash
# 开发模式
npm run dev

# 生产模式
npm start
\`\`\`

### 5. 访问系统
- 前台访问：http://localhost:3000
- 后台管理：http://localhost:3000/admin  
- API文档：http://localhost:3000/api/v1

## 📁 项目结构

\`\`\`
nodejs-cms/
├── src/
│   ├── config/          # 配置文件
│   │   ├── database.js  # 数据库配置
│   │   └── redis.js     # Redis配置
│   ├── models/          # 数据模型
│   │   ├── index.js     # 模型入口
│   │   ├── Level.js     # 管理员模型
│   │   ├── Article.js   # 文章模型
│   │   └── ...          # 其他模型
│   ├── controllers/     # 控制器
│   │   ├── admin/       # 后台控制器
│   │   ├── api/         # API控制器
│   │   └── frontend/    # 前台控制器
│   ├── middleware/      # 中间件
│   │   └── auth.js      # 认证中间件
│   ├── routes/          # 路由
│   │   ├── admin.js     # 后台路由
│   │   ├── api.js       # API路由
│   │   └── frontend.js  # 前台路由
│   ├── services/        # 业务服务
│   ├── utils/           # 工具函数
│   │   └── helpers.js   # 助手函数
│   └── views/           # 视图模板
├── public/              # 静态资源
│   └── uploads/         # 上传文件
├── app.js              # 应用入口
├── package.json        # 依赖配置
└── README.md          # 项目说明
\`\`\`

## 🔧 数据库兼容性

本系统完全兼容极致CMS PHP版本的数据库结构，主要表包括：

- \`jz_level\` - 管理员表
- \`jz_level_group\` - 角色组表  
- \`jz_article\` - 文章表
- \`jz_classtype\` - 栏目分类表
- \`jz_sysconfig\` - 系统配置表
- \`jz_fields\` - 字段表
- \`jz_molds\` - 模型表
- \`jz_member\` - 会员表
- \`jz_comment\` - 评论表
- \`jz_links\` - 友情链接表

## 🔑 API接口

### 认证接口
- \`POST /admin/login\` - 管理员登录
- \`GET /admin/logout\` - 管理员退出

### 内容管理
- \`GET /api/v1/articles\` - 获取文章列表
- \`GET /api/v1/articles/:id\` - 获取文章详情
- \`GET /api/v1/classtypes\` - 获取栏目列表

### 管理后台
- \`GET /admin/article/list\` - 文章管理
- \`GET /admin/classtype/list\` - 栏目管理  
- \`GET /admin/admin/list\` - 管理员管理
- \`GET /admin/sys/config\` - 系统设置

## 🔐 权限系统

系统采用基于角色的权限控制(RBAC)：

1. **超级管理员** - 拥有所有权限
2. **角色组** - 可自定义权限配置
3. **权限节点** - 精确到功能级别的权限控制

## 🚀 部署指南

### 使用PM2部署

\`\`\`bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start app.js --name "jizhicms-nodejs"

# 查看状态
pm2 status

# 查看日志
pm2 logs jizhicms-nodejs
\`\`\`

### 使用Docker部署

\`\`\`dockerfile
# Dockerfile示例
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## 🤝 开发指南

### 添加新功能模块

1. 在 \`src/models/\` 创建数据模型
2. 在 \`src/controllers/\` 创建控制器
3. 在 \`src/routes/\` 添加路由配置
4. 更新权限配置

### 代码规范

- 使用ES6+语法
- 遵循RESTful API设计
- 统一错误处理和返回格式
- 完善的注释和文档

## 📝 更新日志

### v1.0.0 (2024-06-08)
- ✅ 完成基础架构搭建
- ✅ 实现用户认证系统
- ✅ 完成管理员管理功能
- ✅ 实现文章和栏目管理
- ✅ 兼容OLD项目数据库结构

## 🐛 问题反馈

如果您在使用过程中遇到问题，请通过以下方式反馈：

1. 提交Issue
2. 发送邮件
3. 加入QQ群讨论

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源，可免费用于商业项目。

## 🙏 致谢

感谢极致CMS PHP版本为本项目提供的设计思路和数据库结构参考。

---

⭐ 如果这个项目对您有帮助，请给我们一个Star！