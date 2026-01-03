const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// 数据库连接
const db = require('./src/config/database');
const { client: redisClient } = require('./src/config/redis');

// 中间件
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true
}));

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000 // 限制每个IP每15分钟最多1000次请求
});
app.use(limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Session配置 (兼容OLD项目)
app.use(session({
  secret: process.env.SESSION_SECRET || 'jizhicms-nodejs-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_EXPIRE) * 1000 || 1800000
  }
}));

// 静态文件
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// 路由
app.use('/admin', require('./src/routes/admin'));
app.use('/api/v1', require('./src/routes/api'));
app.use('/', require('./src/routes/frontend'));

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '页面未找到' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误' 
  });
});

const PORT = process.env.PORT || 3000;

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await db.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 测试Redis连接
    try {
      await redisClient.ping();
      console.log('✅ Redis连接成功');
    } catch (redisErr) {
      console.log('⚠️  Redis连接失败，将使用内存存储session');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 极致CMS Node.js版本正在运行在端口 ${PORT}`);
      console.log(`📊 管理后台访问地址: http://localhost:${PORT}/admin`);
      console.log(`🌐 前台访问地址: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;