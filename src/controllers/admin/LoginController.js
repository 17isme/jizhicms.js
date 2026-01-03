const jwt = require('jsonwebtoken');
const { Level } = require('../../models');
const { md5, time, getClientIP, JsonReturn } = require('../../utils/helpers');

class LoginController {
  // 显示登录页面
  static async showLogin(req, res) {
    try {
      // 如果已经登录，重定向到后台首页
      if (req.session && req.session.admin) {
        return res.redirect('/admin');
      }
      
      res.render('admin/login');
    } catch (error) {
      console.error('Show login error:', error);
      res.status(500).send('服务器错误');
    }
  }

  // 管理员登录
  static async login(req, res) {
    try {
      const { username, password, captcha } = req.body;
      
      if (!username || !password) {
        return res.json(JsonReturn({
          code: 1,
          msg: '用户名和密码不能为空'
        }));
      }

      // 查找管理员
      const admin = await Level.findOne({
        where: { username },
        include: [
          {
            model: require('../../models').LevelGroup,
            as: 'group'
          }
        ]
      });

      if (!admin) {
        return res.json(JsonReturn({
          code: 1,
          msg: '用户名或密码错误'
        }));
      }

      // 验证密码（兼容OLD项目的MD5加密）
      if (admin.password !== md5(password)) {
        return res.json(JsonReturn({
          code: 1,
          msg: '用户名或密码错误'
        }));
      }

      // 更新登录信息
      await admin.update({
        login_num: admin.login_num + 1,
        login_time: time(),
        login_ip: getClientIP(req)
      });

      // 准备session数据（兼容OLD项目）
      const adminData = {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        gid: admin.gid,
        isadmin: admin.isadmin,
        classcontrol: admin.classcontrol,
        purviews: admin.purviews,
        groupname: admin.group ? admin.group.name : '默认组'
      };

      // 设置session（兼容OLD项目）
      req.session.admin = adminData;

      // 生成JWT token
      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.APP_SECRET,
        { expiresIn: '24h' }
      );

      // 设置cookie
      res.cookie('adminToken', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24小时
      });

      res.json(JsonReturn({
        code: 0,
        msg: '登录成功',
        data: {
          admin: adminData,
          token
        }
      }));

    } catch (error) {
      console.error('Login error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '登录失败，请稍后重试'
      }));
    }
  }

  // 管理员退出登录
  static async logout(req, res) {
    try {
      // 清除session
      req.session.destroy();
      
      // 清除cookie
      res.clearCookie('adminToken');
      
      res.json(JsonReturn({
        code: 0,
        msg: '退出成功'
      }));
    } catch (error) {
      console.error('Logout error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '退出失败'
      }));
    }
  }

  // 生成验证码（简单实现）
  static async captcha(req, res) {
    try {
      // 这里可以使用验证码库生成图片验证码
      // 暂时返回一个简单的数字验证码
      const code = Math.floor(1000 + Math.random() * 9000);
      
      // 保存到session
      req.session.captcha = code;
      
      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: {
          captcha: code // 实际项目中应该返回图片
        }
      }));
    } catch (error) {
      console.error('Captcha error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '验证码生成失败'
      }));
    }
  }
}

module.exports = LoginController;