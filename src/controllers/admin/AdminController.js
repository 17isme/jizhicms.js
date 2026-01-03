const { Level, LevelGroup } = require('../../models');
const { JsonReturn, md5, time, formatParam, getPagination } = require('../../utils/helpers');
const { Op } = require('sequelize');

class AdminController {
  // 管理员列表
  static async list(req, res) {
    try {
      const page = formatParam(req.query.page, 1, 1);
      const pageSize = formatParam(req.query.limit, 1, 10);
      const keyword = formatParam(req.query.keyword);
      
      const { offset } = getPagination(page, pageSize);
      
      // 构建查询条件
      const where = {};
      if (keyword) {
        where[Op.or] = [
          { username: { [Op.like]: `%${keyword}%` } },
          { name: { [Op.like]: `%${keyword}%` } }
        ];
      }
      
      // 非超级管理员不能看到超级管理员
      if (req.admin.isadmin !== 1) {
        where.isadmin = 0;
      }

      const { count, rows } = await Level.findAndCountAll({
        where,
        include: [
          {
            model: LevelGroup,
            as: 'group',
            attributes: ['name']
          }
        ],
        limit: pageSize,
        offset,
        order: [['id', 'DESC']]
      });

      // 格式化数据
      const list = rows.map(admin => ({
        id: admin.id,
        username: admin.username,
        name: admin.name,
        groupname: admin.group ? admin.group.name : '默认组',
        phone: admin.phone,
        email: admin.email,
        isadmin: admin.isadmin,
        login_num: admin.login_num,
        login_time: admin.login_time,
        addtime: admin.addtime
      }));

      const pagination = getPagination(page, pageSize, count);

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json(JsonReturn({
          code: 0,
          msg: 'success',
          data: {
            list,
            pagination
          }
        }));
      }

      res.render('layouts/admin', {
        title: '管理员管理 - 极致CMS管理后台',
        user: req.admin,
        body: await new Promise((resolve) => {
          res.render('admin/admin-list', {
            admins: list,
            pagination,
            query: req.query
          }, (err, html) => {
            if (err) {
              console.error('Render error:', err);
              resolve('<div class="alert alert-danger">页面渲染失败</div>');
            } else {
              resolve(html);
            }
          });
        })
      });

    } catch (error) {
      console.error('Admin list error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取管理员列表失败'
      }));
    }
  }

  // 添加管理员页面
  static async add(req, res) {
    try {
      // 获取角色组列表
      const groups = await LevelGroup.findAll({
        attributes: ['id', 'name'],
        order: [['id', 'ASC']]
      });

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json(JsonReturn({
          code: 0,
          msg: 'success',
          data: {
            groups
          }
        }));
      }

      res.render('layouts/admin', {
        title: '添加管理员 - 极致CMS管理后台',
        user: req.admin,
        body: await new Promise((resolve) => {
          res.render('admin/admin-add', {
            groups
          }, (err, html) => {
            if (err) {
              console.error('Render error:', err);
              resolve('<div class="alert alert-danger">页面渲染失败</div>');
            } else {
              resolve(html);
            }
          });
        })
      });
    } catch (error) {
      console.error('Admin add error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取数据失败'
      }));
    }
  }

  // 保存管理员
  static async save(req, res) {
    try {
      const { username, password, name, gid, phone, email, isadmin, purviews } = req.body;

      if (!username || !password) {
        return res.json(JsonReturn({
          code: 1,
          msg: '用户名和密码不能为空'
        }));
      }

      // 检查用户名是否存在
      const existAdmin = await Level.findOne({ where: { username } });
      if (existAdmin) {
        return res.json(JsonReturn({
          code: 1,
          msg: '用户名已存在'
        }));
      }

      // 只有超级管理员可以设置超级管理员
      let isAdminFlag = 0;
      if (req.admin.isadmin === 1 && isadmin === 1) {
        isAdminFlag = 1;
      }

      const adminData = {
        username,
        password: md5(password),
        name: name || username,
        gid: formatParam(gid, 1, 0),
        phone: phone || '',
        email: email || '',
        isadmin: isAdminFlag,
        purviews: Array.isArray(purviews) ? JSON.stringify(purviews) : (purviews || ''),
        addtime: time()
      };

      const newAdmin = await Level.create(adminData);

      res.json(JsonReturn({
        code: 0,
        msg: '添加成功',
        data: { id: newAdmin.id }
      }));

    } catch (error) {
      console.error('Admin save error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '添加失败'
      }));
    }
  }

  // 编辑管理员
  static async edit(req, res) {
    try {
      const id = formatParam(req.params.id, 1);
      
      const admin = await Level.findByPk(id, {
        include: [
          {
            model: LevelGroup,
            as: 'group'
          }
        ]
      });

      if (!admin) {
        return res.json(JsonReturn({
          code: 1,
          msg: '管理员不存在'
        }));
      }

      // 获取角色组列表
      const groups = await LevelGroup.findAll({
        attributes: ['id', 'name'],
        order: [['id', 'ASC']]
      });

      // 解析权限
      let purviews = [];
      try {
        purviews = admin.purviews ? JSON.parse(admin.purviews) : [];
      } catch (e) {
        purviews = admin.purviews ? admin.purviews.split(',') : [];
      }

      const adminData = {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        gid: admin.gid,
        phone: admin.phone,
        email: admin.email,
        isadmin: admin.isadmin,
        purviews
      };

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json(JsonReturn({
          code: 0,
          msg: 'success',
          data: {
            admin: adminData,
            groups
          }
        }));
      }

      res.render('layouts/admin', {
        title: '编辑管理员 - 极致CMS管理后台',
        user: req.admin,
        body: await new Promise((resolve) => {
          res.render('admin/admin-edit', {
            admin: adminData,
            groups
          }, (err, html) => {
            if (err) {
              console.error('Render error:', err);
              resolve('<div class="alert alert-danger">页面渲染失败</div>');
            } else {
              resolve(html);
            }
          });
        })
      });

    } catch (error) {
      console.error('Admin edit error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取管理员信息失败'
      }));
    }
  }

  // 更新管理员
  static async update(req, res) {
    try {
      const id = formatParam(req.params.id, 1);
      const { username, password, name, gid, phone, email, isadmin, purviews } = req.body;

      const admin = await Level.findByPk(id);
      if (!admin) {
        return res.json(JsonReturn({
          code: 1,
          msg: '管理员不存在'
        }));
      }

      // 检查用户名是否被其他用户使用
      if (username !== admin.username) {
        const existAdmin = await Level.findOne({ 
          where: { 
            username,
            id: { [Op.ne]: id }
          }
        });
        if (existAdmin) {
          return res.json(JsonReturn({
            code: 1,
            msg: '用户名已存在'
          }));
        }
      }

      const updateData = {
        username,
        name: name || username,
        gid: formatParam(gid, 1, 0),
        phone: phone || '',
        email: email || '',
        purviews: Array.isArray(purviews) ? JSON.stringify(purviews) : (purviews || '')
      };

      // 如果提供了密码，则更新密码
      if (password) {
        updateData.password = md5(password);
      }

      // 只有超级管理员可以设置超级管理员
      if (req.admin.isadmin === 1) {
        updateData.isadmin = isadmin === 1 ? 1 : 0;
      }

      await admin.update(updateData);

      res.json(JsonReturn({
        code: 0,
        msg: '更新成功'
      }));

    } catch (error) {
      console.error('Admin update error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '更新失败'
      }));
    }
  }

  // 删除管理员
  static async delete(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.json(JsonReturn({
          code: 1,
          msg: '请选择要删除的管理员'
        }));
      }

      // 不能删除自己
      if (ids.includes(req.admin.id)) {
        return res.json(JsonReturn({
          code: 1,
          msg: '不能删除自己'
        }));
      }

      // 非超级管理员不能删除超级管理员
      if (req.admin.isadmin !== 1) {
        const superAdmins = await Level.findAll({
          where: {
            id: { [Op.in]: ids },
            isadmin: 1
          }
        });
        
        if (superAdmins.length > 0) {
          return res.json(JsonReturn({
            code: 1,
            msg: '权限不足，无法删除超级管理员'
          }));
        }
      }

      await Level.destroy({
        where: {
          id: { [Op.in]: ids }
        }
      });

      res.json(JsonReturn({
        code: 0,
        msg: '删除成功'
      }));

    } catch (error) {
      console.error('Admin delete error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '删除失败'
      }));
    }
  }

  // 角色组管理
  static async group(req, res) {
    try {
      const page = formatParam(req.query.page, 1, 1);
      const pageSize = formatParam(req.query.limit, 1, 10);
      
      const { offset } = getPagination(page, pageSize);

      const { count, rows } = await LevelGroup.findAndCountAll({
        limit: pageSize,
        offset,
        order: [['id', 'DESC']]
      });

      const pagination = getPagination(page, pageSize, count);

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json(JsonReturn({
          code: 0,
          msg: 'success',
          data: {
            list: rows,
            pagination
          }
        }));
      }

      res.render('layouts/admin', {
        title: '角色组管理 - 极致CMS管理后台',
        user: req.admin,
        body: await new Promise((resolve) => {
          res.render('admin/group-list', {
            groups: rows,
            pagination
          }, (err, html) => {
            if (err) {
              console.error('Render error:', err);
              resolve('<div class="alert alert-danger">页面渲染失败</div>');
            } else {
              resolve(html);
            }
          });
        })
      });

    } catch (error) {
      console.error('Group list error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取角色组列表失败'
      }));
    }
  }

  // 保存角色组
  static async groupSave(req, res) {
    try {
      const { name, purviews } = req.body;

      if (!name) {
        return res.json(JsonReturn({
          code: 1,
          msg: '角色组名称不能为空'
        }));
      }

      const groupData = {
        name,
        purviews: Array.isArray(purviews) ? JSON.stringify(purviews) : (purviews || ''),
        addtime: time()
      };

      const newGroup = await LevelGroup.create(groupData);

      res.json(JsonReturn({
        code: 0,
        msg: '添加成功',
        data: { id: newGroup.id }
      }));

    } catch (error) {
      console.error('Group save error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '添加失败'
      }));
    }
  }

  // 删除角色组
  static async groupDelete(req, res) {
    try {
      const { id } = req.body;

      if (!id) {
        return res.json(JsonReturn({
          code: 1,
          msg: '参数错误'
        }));
      }

      // 检查是否有管理员使用此角色组
      const adminCount = await Level.count({ where: { gid: id } });
      if (adminCount > 0) {
        return res.json(JsonReturn({
          code: 1,
          msg: '该角色组下存在用户，请先移除用户再删除'
        }));
      }

      await LevelGroup.destroy({ where: { id } });

      res.json(JsonReturn({
        code: 0,
        msg: '删除成功'
      }));

    } catch (error) {
      console.error('Group delete error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '删除失败'
      }));
    }
  }

  // 获取当前登录管理员信息
  static async info(req, res) {
    try {
      const admin = await Level.findByPk(req.admin.id, {
        include: [
          {
            model: LevelGroup,
            as: 'group',
            attributes: ['name']
          }
        ]
      });

      if (!admin) {
        return res.json(JsonReturn({
          code: 1,
          msg: '管理员不存在'
        }));
      }

      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          groupname: admin.group ? admin.group.name : '默认组',
          phone: admin.phone,
          email: admin.email,
          isadmin: admin.isadmin,
          login_num: admin.login_num,
          login_time: admin.login_time
        }
      }));

    } catch (error) {
      console.error('Admin info error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取管理员信息失败'
      }));
    }
  }
}

module.exports = AdminController;