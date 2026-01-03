const { Classtype } = require('../../models');
const { JsonReturn, time, formatParam, buildTree, htmlEncode } = require('../../utils/helpers');
const { Op } = require('sequelize');

class ClasstypeController {
  // 栏目列表
  static async list(req, res) {
    try {
      const classtypes = await Classtype.findAll({
        order: [['orders', 'ASC'], ['id', 'ASC']]
      });

      // 构建树形结构
      const tree = buildTree(classtypes.map(item => item.toJSON()));

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json(JsonReturn({
          code: 0,
          msg: 'success',
          data: {
            list: classtypes,
            tree
          }
        }));
      }

      res.render('layouts/admin', {
        title: '栏目管理 - 极致CMS管理后台',
        user: req.admin,
        body: await new Promise((resolve) => {
          res.render('admin/classtype-list', {
            classtypes: tree,
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
      console.error('Classtype list error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取栏目列表失败'
      }));
    }
  }

  // 添加栏目页面
  static async add(req, res) {
    try {
      // 获取父级栏目列表
      const parentClasstypes = await Classtype.findAll({
        attributes: ['id', 'title', 'pid'],
        order: [['orders', 'ASC'], ['id', 'ASC']]
      });

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json(JsonReturn({
          code: 0,
          msg: 'success',
          data: {
            parentClasstypes
          }
        }));
      }

      const pid = formatParam(req.query.pid, 1, 0);

      res.render('layouts/admin', {
        title: '添加栏目 - 极致CMS管理后台',
        user: req.admin,
        body: await new Promise((resolve) => {
          res.render('admin/classtype-add', {
            parentClasstypes,
            pid
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
      console.error('Classtype add error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取数据失败'
      }));
    }
  }

  // 保存栏目
  static async save(req, res) {
    try {
      const { 
        title, biaoshi, pid, keywords, description, body, 
        molds, litpic, banner, isshow, target, htmlurl, ownurl,
        template_list, template_show, pagesize, orders 
      } = req.body;

      if (!title) {
        return res.json(JsonReturn({
          code: 1,
          msg: '栏目名称不能为空'
        }));
      }

      // 检查标识是否重复
      if (biaoshi) {
        const existClasstype = await Classtype.findOne({ where: { biaoshi } });
        if (existClasstype) {
          return res.json(JsonReturn({
            code: 1,
            msg: '栏目标识已存在'
          }));
        }
      }

      // 处理父级ID路径
      let pids = '0';
      const parentId = formatParam(pid, 1, 0);
      if (parentId > 0) {
        const parent = await Classtype.findByPk(parentId);
        if (parent) {
          pids = parent.pids ? `${parent.pids},${parentId}` : `0,${parentId}`;
        }
      }

      const classtypeData = {
        title: htmlEncode(title),
        biaoshi: biaoshi || '',
        pid: parentId,
        pids,
        keywords: keywords || '',
        description: description || '',
        body: body || '',
        molds: molds || 'article',
        litpic: litpic || '',
        banner: banner || '',
        isshow: formatParam(isshow, 1, 1),
        target: target || '',
        htmlurl: htmlurl || '',
        ownurl: ownurl || '',
        template_list: template_list || '',
        template_show: template_show || '',
        pagesize: formatParam(pagesize, 1, 10),
        orders: formatParam(orders, 1, 0),
        addtime: time()
      };

      const newClasstype = await Classtype.create(classtypeData);

      res.json(JsonReturn({
        code: 0,
        msg: '添加成功',
        data: { id: newClasstype.id }
      }));

    } catch (error) {
      console.error('Classtype save error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '添加失败'
      }));
    }
  }

  // 编辑栏目
  static async edit(req, res) {
    try {
      const id = formatParam(req.params.id, 1);
      
      const classtype = await Classtype.findByPk(id);

      if (!classtype) {
        return res.json(JsonReturn({
          code: 1,
          msg: '栏目不存在'
        }));
      }

      // 获取父级栏目列表（排除自己和子栏目）
      const parentClasstypes = await Classtype.findAll({
        where: {
          id: { [Op.ne]: id },
          pids: { [Op.notLike]: `%,${id},%` }
        },
        attributes: ['id', 'title', 'pid'],
        order: [['orders', 'ASC'], ['id', 'ASC']]
      });

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json(JsonReturn({
          code: 0,
          msg: 'success',
          data: {
            classtype,
            parentClasstypes
          }
        }));
      }

      res.render('layouts/admin', {
        title: '编辑栏目 - 极致CMS管理后台',
        user: req.admin,
        body: await new Promise((resolve) => {
          res.render('admin/classtype-edit', {
            classtype,
            parentClasstypes
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
      console.error('Classtype edit error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取栏目信息失败'
      }));
    }
  }

  // 更新栏目
  static async update(req, res) {
    try {
      const id = formatParam(req.params.id, 1);
      const { 
        title, biaoshi, pid, keywords, description, body, 
        molds, litpic, banner, isshow, target, htmlurl, ownurl,
        template_list, template_show, pagesize, orders 
      } = req.body;

      const classtype = await Classtype.findByPk(id);
      if (!classtype) {
        return res.json(JsonReturn({
          code: 1,
          msg: '栏目不存在'
        }));
      }

      if (!title) {
        return res.json(JsonReturn({
          code: 1,
          msg: '栏目名称不能为空'
        }));
      }

      // 检查标识是否被其他栏目使用
      if (biaoshi && biaoshi !== classtype.biaoshi) {
        const existClasstype = await Classtype.findOne({ 
          where: { 
            biaoshi,
            id: { [Op.ne]: id }
          }
        });
        if (existClasstype) {
          return res.json(JsonReturn({
            code: 1,
            msg: '栏目标识已存在'
          }));
        }
      }

      // 处理父级ID路径
      let pids = '0';
      const parentId = formatParam(pid, 1, 0);
      if (parentId > 0 && parentId !== id) {
        const parent = await Classtype.findByPk(parentId);
        if (parent) {
          // 检查是否会形成循环引用
          if (parent.pids && parent.pids.includes(`,${id},`)) {
            return res.json(JsonReturn({
              code: 1,
              msg: '不能选择自己的子栏目作为父栏目'
            }));
          }
          pids = parent.pids ? `${parent.pids},${parentId}` : `0,${parentId}`;
        }
      }

      const updateData = {
        title: htmlEncode(title),
        biaoshi: biaoshi || '',
        pid: parentId,
        pids,
        keywords: keywords || '',
        description: description || '',
        body: body || '',
        molds: molds || 'article',
        litpic: litpic || '',
        banner: banner || '',
        isshow: formatParam(isshow, 1, 1),
        target: target || '',
        htmlurl: htmlurl || '',
        ownurl: ownurl || '',
        template_list: template_list || '',
        template_show: template_show || '',
        pagesize: formatParam(pagesize, 1, 10),
        orders: formatParam(orders, 1, 0)
      };

      await classtype.update(updateData);

      // 如果修改了父级关系，需要更新所有子栏目的pids
      if (parentId !== classtype.pid) {
        await this.updateChildrenPids(id);
      }

      res.json(JsonReturn({
        code: 0,
        msg: '更新成功'
      }));

    } catch (error) {
      console.error('Classtype update error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '更新失败'
      }));
    }
  }

  // 删除栏目
  static async delete(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.json(JsonReturn({
          code: 1,
          msg: '请选择要删除的栏目'
        }));
      }

      // 检查是否有子栏目
      for (const id of ids) {
        const childCount = await Classtype.count({ where: { pid: id } });
        if (childCount > 0) {
          return res.json(JsonReturn({
            code: 1,
            msg: '请先删除子栏目'
          }));
        }
      }

      await Classtype.destroy({
        where: {
          id: { [Op.in]: ids }
        }
      });

      res.json(JsonReturn({
        code: 0,
        msg: '删除成功'
      }));

    } catch (error) {
      console.error('Classtype delete error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '删除失败'
      }));
    }
  }

  // 更新子栏目的pids路径
  static async updateChildrenPids(parentId) {
    try {
      const parent = await Classtype.findByPk(parentId);
      if (!parent) return;

      const children = await Classtype.findAll({ where: { pid: parentId } });
      
      for (const child of children) {
        const newPids = parent.pids ? `${parent.pids},${parentId}` : `0,${parentId}`;
        await child.update({ pids: newPids });
        
        // 递归更新子栏目的子栏目
        await this.updateChildrenPids(child.id);
      }
    } catch (error) {
      console.error('Update children pids error:', error);
    }
  }
}

module.exports = ClasstypeController;