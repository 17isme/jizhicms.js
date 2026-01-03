const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { JsonReturn, time, randomString } = require('../../utils/helpers');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 按日期创建目录
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const uploadPath = path.join(__dirname, '../../../public/uploads', year.toString(), month, day);
    
    // 确保目录存在
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}_${randomString(6)}${ext}`;
    cb(null, filename);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 默认10MB
  }
});

class UploadController {
  // 单文件上传
  static upload = upload.single('file');
  
  static async uploadHandler(req, res) {
    try {
      UploadController.upload(req, res, function (err) {
        if (err) {
          console.error('Upload error:', err);
          
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.json(JsonReturn({
                code: 1,
                msg: '文件大小超出限制'
              }));
            }
          }
          
          return res.json(JsonReturn({
            code: 1,
            msg: err.message || '上传失败'
          }));
        }
        
        if (!req.file) {
          return res.json(JsonReturn({
            code: 1,
            msg: '请选择要上传的文件'
          }));
        }
        
        // 构建文件访问URL
        const relativePath = req.file.path.replace(path.join(__dirname, '../../../public'), '');
        const fileUrl = relativePath.replace(/\\/g, '/'); // Windows路径转换
        
        // 文件信息
        const fileInfo = {
          originalName: req.file.originalname,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl,
          fullUrl: `${req.protocol}://${req.get('host')}${fileUrl}`,
          uploadTime: time()
        };
        
        res.json(JsonReturn({
          code: 0,
          msg: '上传成功',
          data: fileInfo
        }));
      });
      
    } catch (error) {
      console.error('Upload handler error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '上传失败'
      }));
    }
  }

  // 多文件上传
  static uploadMultiple = upload.array('files', 10);
  
  static async uploadMultipleHandler(req, res) {
    try {
      UploadController.uploadMultiple(req, res, function (err) {
        if (err) {
          console.error('Upload multiple error:', err);
          return res.json(JsonReturn({
            code: 1,
            msg: err.message || '上传失败'
          }));
        }
        
        if (!req.files || req.files.length === 0) {
          return res.json(JsonReturn({
            code: 1,
            msg: '请选择要上传的文件'
          }));
        }
        
        // 处理多个文件信息
        const filesInfo = req.files.map(file => {
          const relativePath = file.path.replace(path.join(__dirname, '../../../public'), '');
          const fileUrl = relativePath.replace(/\\/g, '/');
          
          return {
            originalName: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            url: fileUrl,
            fullUrl: `${req.protocol}://${req.get('host')}${fileUrl}`,
            uploadTime: time()
          };
        });
        
        res.json(JsonReturn({
          code: 0,
          msg: '上传成功',
          data: filesInfo
        }));
      });
      
    } catch (error) {
      console.error('Upload multiple handler error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '上传失败'
      }));
    }
  }

  // 删除文件
  static async deleteFile(req, res) {
    try {
      const { filePath } = req.body;
      
      if (!filePath) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文件路径不能为空'
        }));
      }
      
      // 构建完整文件路径
      const fullPath = path.join(__dirname, '../../../public', filePath);
      
      // 检查文件是否存在
      if (!fs.existsSync(fullPath)) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文件不存在'
        }));
      }
      
      // 删除文件
      fs.unlinkSync(fullPath);
      
      res.json(JsonReturn({
        code: 0,
        msg: '删除成功'
      }));
      
    } catch (error) {
      console.error('Delete file error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '删除失败'
      }));
    }
  }

  // 获取上传配置
  static async getUploadConfig(req, res) {
    try {
      const config = {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
        allowedTypes: [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        uploadPath: process.env.UPLOAD_PATH || './public/uploads'
      };
      
      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: config
      }));
      
    } catch (error) {
      console.error('Get upload config error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取上传配置失败'
      }));
    }
  }
}

module.exports = UploadController;