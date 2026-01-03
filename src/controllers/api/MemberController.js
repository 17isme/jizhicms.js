const { Member } = require('../../models');
const { JsonReturn, md5, time, getClientIP } = require('../../utils/helpers');
const { Op } = require('sequelize');

class MemberApiController {
  // 会员注册
  static async register(req, res) {
    try {
      const { username, password, nickname, email, phone } = req.body;
      
      if (!username || !password) {
        return res.json(JsonReturn({
          code: 1,
          msg: '用户名和密码不能为空'
        }));
      }

      if (username.length < 3 || username.length > 20) {
        return res.json(JsonReturn({
          code: 1,
          msg: '用户名长度为3-20个字符'
        }));
      }

      if (password.length < 6) {
        return res.json(JsonReturn({
          code: 1,
          msg: '密码长度不能少于6位'
        }));
      }

      // 检查用户名是否已存在
      const existMember = await Member.findOne({
        where: {
          [Op.or]: [
            { username },
            { email: email || '' },
            { phone: phone || '' }
          ]
        }
      });

      if (existMember) {
        if (existMember.username === username) {
          return res.json(JsonReturn({
            code: 1,
            msg: '用户名已存在'
          }));
        }
        if (email && existMember.email === email) {
          return res.json(JsonReturn({
            code: 1,
            msg: '邮箱已被注册'
          }));
        }
        if (phone && existMember.phone === phone) {
          return res.json(JsonReturn({
            code: 1,
            msg: '手机号已被注册'
          }));
        }
      }

      // 创建会员
      const memberData = {
        username,
        password: md5(password),
        nickname: nickname || username,
        email: email || '',
        phone: phone || '',
        addtime: time(),
        login_ip: getClientIP(req),
        ischeck: 1 // 默认通过审核，可根据需要修改
      };

      const newMember = await Member.create(memberData);

      res.json(JsonReturn({
        code: 0,
        msg: '注册成功',
        data: {
          id: newMember.id,
          username: newMember.username,
          nickname: newMember.nickname
        }
      }));

    } catch (error) {
      console.error('Member register error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '注册失败，请稍后重试'
      }));
    }
  }

  // 会员登录
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.json(JsonReturn({
          code: 1,
          msg: '用户名和密码不能为空'
        }));
      }

      // 查找会员
      const member = await Member.findOne({
        where: {
          [Op.or]: [
            { username },
            { email: username },
            { phone: username }
          ],
          ischeck: 1
        }
      });

      if (!member) {
        return res.json(JsonReturn({
          code: 1,
          msg: '用户名或密码错误'
        }));
      }

      // 验证密码
      if (member.password !== md5(password)) {
        return res.json(JsonReturn({
          code: 1,
          msg: '用户名或密码错误'
        }));
      }

      // 更新登录信息
      await member.update({
        login_num: member.login_num + 1,
        login_time: time(),
        login_ip: getClientIP(req)
      });

      // 设置会员session
      req.session.member = {
        id: member.id,
        username: member.username,
        nickname: member.nickname,
        face: member.face,
        money: member.money,
        point: member.point
      };

      res.json(JsonReturn({
        code: 0,
        msg: '登录成功',
        data: {
          id: member.id,
          username: member.username,
          nickname: member.nickname,
          face: member.face,
          money: member.money,
          point: member.point
        }
      }));

    } catch (error) {
      console.error('Member login error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '登录失败，请稍后重试'
      }));
    }
  }

  // 获取会员信息
  static async profile(req, res) {
    try {
      if (!req.session.member) {
        return res.json(JsonReturn({
          code: 1,
          msg: '请先登录'
        }));
      }

      const member = await Member.findByPk(req.session.member.id, {
        attributes: [
          'id', 'username', 'nickname', 'email', 'phone', 'face',
          'money', 'point', 'sex', 'birthday', 'login_num', 'login_time', 'addtime'
        ]
      });

      if (!member) {
        return res.json(JsonReturn({
          code: 1,
          msg: '会员不存在'
        }));
      }

      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: {
          id: member.id,
          username: member.username,
          nickname: member.nickname,
          email: member.email,
          phone: member.phone,
          face: member.face,
          money: member.money,
          point: member.point,
          sex: member.sex,
          birthday: member.birthday,
          login_num: member.login_num,
          login_time: member.login_time,
          addtime: member.addtime
        }
      }));

    } catch (error) {
      console.error('Member profile error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取会员信息失败'
      }));
    }
  }

  // 更新会员信息
  static async update(req, res) {
    try {
      if (!req.session.member) {
        return res.json(JsonReturn({
          code: 1,
          msg: '请先登录'
        }));
      }

      const { nickname, email, phone, face, sex, birthday } = req.body;
      
      const member = await Member.findByPk(req.session.member.id);

      if (!member) {
        return res.json(JsonReturn({
          code: 1,
          msg: '会员不存在'
        }));
      }

      // 检查邮箱和手机号是否被其他用户使用
      if (email || phone) {
        const existMember = await Member.findOne({
          where: {
            id: { [Op.ne]: member.id },
            [Op.or]: [
              { email: email || '' },
              { phone: phone || '' }
            ]
          }
        });

        if (existMember) {
          if (email && existMember.email === email) {
            return res.json(JsonReturn({
              code: 1,
              msg: '邮箱已被其他用户使用'
            }));
          }
          if (phone && existMember.phone === phone) {
            return res.json(JsonReturn({
              code: 1,
              msg: '手机号已被其他用户使用'
            }));
          }
        }
      }

      // 更新会员信息
      const updateData = {};
      if (nickname) updateData.nickname = nickname;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (face) updateData.face = face;
      if (sex !== undefined) updateData.sex = sex;
      if (birthday) updateData.birthday = birthday;

      await member.update(updateData);

      // 更新session
      req.session.member = {
        ...req.session.member,
        nickname: member.nickname,
        face: member.face
      };

      res.json(JsonReturn({
        code: 0,
        msg: '更新成功',
        data: {
          nickname: member.nickname,
          email: member.email,
          phone: member.phone,
          face: member.face,
          sex: member.sex,
          birthday: member.birthday
        }
      }));

    } catch (error) {
      console.error('Member update error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '更新失败，请稍后重试'
      }));
    }
  }

  // 会员退出登录
  static async logout(req, res) {
    try {
      req.session.member = null;
      
      res.json(JsonReturn({
        code: 0,
        msg: '退出成功'
      }));
    } catch (error) {
      console.error('Member logout error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '退出失败'
      }));
    }
  }
}

module.exports = MemberApiController;