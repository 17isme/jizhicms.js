const { Sysconfig } = require('../../models');
const { JsonReturn, getCache, setCache, delCache } = require('../../utils/helpers');
const { cache } = require('../../config/redis');

class SysController {
  // 系统配置页面
  static async config(req, res) {
    try {
      // 获取所有系统配置
      const configs = await Sysconfig.findAll({
        order: [['listorders', 'ASC'], ['id', 'ASC']]
      });

      // 按类型分组配置
      const configGroups = {
        basic: [], // 基础配置
        site: [],  // 站点配置
        seo: [],   // SEO配置
        upload: [], // 上传配置
        other: []  // 其他配置
      };

      configs.forEach(config => {
        const configData = {
          id: config.id,
          field: config.field,
          title: config.title,
          tip: config.tip,
          type: config.type,
          data: config.data,
          issystem: config.issystem
        };

        // 根据字段名分组
        if (['web_name', 'web_title', 'web_logo', 'web_favicon'].includes(config.field)) {
          configGroups.basic.push(configData);
        } else if (['web_keywords', 'web_description'].includes(config.field)) {
          configGroups.seo.push(configData);
        } else if (['upload_type', 'upload_size', 'upload_path'].includes(config.field)) {
          configGroups.upload.push(configData);
        } else if (['copyright', 'record', 'statistics'].includes(config.field)) {
          configGroups.site.push(configData);
        } else {
          configGroups.other.push(configData);
        }
      });

      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: {
          configs,
          configGroups
        }
      }));

    } catch (error) {
      console.error('Sys config error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取系统配置失败'
      }));
    }
  }

  // 保存系统配置
  static async configSave(req, res) {
    try {
      const configData = req.body;

      if (!configData || Object.keys(configData).length === 0) {
        return res.json(JsonReturn({
          code: 1,
          msg: '配置数据不能为空'
        }));
      }

      // 批量更新配置
      const updatePromises = [];
      
      for (const [field, value] of Object.entries(configData)) {
        const promise = Sysconfig.update(
          { data: value },
          { where: { field } }
        );
        updatePromises.push(promise);
      }

      await Promise.all(updatePromises);

      // 清除配置缓存
      await delCache('webconfig');

      res.json(JsonReturn({
        code: 0,
        msg: '保存成功'
      }));

    } catch (error) {
      console.error('Sys config save error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '保存失败'
      }));
    }
  }

  // 清除缓存
  static async clearCache(req, res) {
    try {
      const type = req.query.type || 'all';

      switch (type) {
        case 'config':
          // 清除配置缓存
          await delCache('webconfig');
          break;
          
        case 'all':
          // 清除所有缓存
          try {
            await cache.client.flushDb();
          } catch (redisError) {
            console.log('Redis clear error:', redisError);
          }
          break;
          
        default:
          // 清除指定缓存
          await delCache(type);
          break;
      }

      res.json(JsonReturn({
        code: 0,
        msg: '缓存清除成功'
      }));

    } catch (error) {
      console.error('Clear cache error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '缓存清除失败'
      }));
    }
  }

  // 获取系统信息
  static async systemInfo(req, res) {
    try {
      const systemInfo = {
        server: {
          nodejs: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: Math.floor(process.uptime()),
          memory: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        },
        database: {
          type: 'MySQL',
          host: process.env.DB_HOST,
          name: process.env.DB_NAME
        },
        cache: {
          type: 'Redis',
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: systemInfo
      }));

    } catch (error) {
      console.error('System info error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取系统信息失败'
      }));
    }
  }

  // 数据库备份
  static async databaseBackup(req, res) {
    try {
      // 这里可以实现数据库备份功能
      // 暂时返回提示信息
      res.json(JsonReturn({
        code: 0,
        msg: '数据库备份功能开发中'
      }));

    } catch (error) {
      console.error('Database backup error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '数据库备份失败'
      }));
    }
  }

  // 系统日志
  static async systemLog(req, res) {
    try {
      // 这里可以实现系统日志功能
      // 暂时返回空数据
      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: {
          logs: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0
          }
        }
      }));

    } catch (error) {
      console.error('System log error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取系统日志失败'
      }));
    }
  }
}

module.exports = SysController;