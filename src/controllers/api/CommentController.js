const { Comment, Article, Member } = require('../../models');
const { JsonReturn, formatTime, getClientIP, time } = require('../../utils/helpers');

class CommentApiController {
  // 获取评论列表
  static async list(req, res) {
    try {
      const aid = parseInt(req.query.aid);
      const page = parseInt(req.query.page) || 1;
      const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 50);
      
      if (!aid) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章ID不能为空'
        }));
      }

      // 验证文章是否存在
      const article = await Article.findOne({
        where: {
          id: aid,
          isshow: 1
        },
        attributes: ['id', 'title', 'comment_num']
      });

      if (!article) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章不存在'
        }));
      }

      const offset = (page - 1) * pageSize;

      // 获取主评论列表
      const { count, rows } = await Comment.findAndCountAll({
        where: {
          aid,
          isshow: 1,
          pid: 0
        },
        include: [
          {
            model: Member,
            as: 'member',
            attributes: ['id', 'nickname', 'face'],
            required: false
          }
        ],
        order: [['addtime', 'DESC']],
        limit: pageSize,
        offset
      });

      // 获取每个主评论的回复
      const comments = await Promise.all(rows.map(async (comment) => {
        const replies = await Comment.findAll({
          where: {
            aid,
            pid: comment.id,
            isshow: 1
          },
          include: [
            {
              model: Member,
              as: 'member',
              attributes: ['id', 'nickname', 'face'],
              required: false
            }
          ],
          order: [['addtime', 'ASC']],
          limit: 10
        });

        return {
          id: comment.id,
          content: comment.content,
          nickname: comment.nickname || (comment.member ? comment.member.nickname : '匿名用户'),
          face: comment.face || (comment.member ? comment.member.face : ''),
          zan: comment.zan || 0,
          addtime: formatTime(comment.addtime),
          addtime_timestamp: comment.addtime,
          member_id: comment.member_id,
          replies: replies.map(reply => ({
            id: reply.id,
            content: reply.content,
            nickname: reply.nickname || (reply.member ? reply.member.nickname : '匿名用户'),
            face: reply.face || (reply.member ? reply.member.face : ''),
            addtime: formatTime(reply.addtime),
            addtime_timestamp: reply.addtime,
            member_id: reply.member_id
          }))
        };
      }));

      // 分页信息
      const totalPages = Math.ceil(count / pageSize);
      const pagination = {
        current: page,
        total: count,
        totalPages,
        pageSize,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };

      res.json(JsonReturn({
        code: 0,
        msg: 'success',
        data: {
          article: {
            id: article.id,
            title: article.title,
            comment_num: article.comment_num || 0
          },
          comments,
          pagination
        }
      }));

    } catch (error) {
      console.error('Comment API list error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '获取评论列表失败'
      }));
    }
  }

  // 添加评论
  static async add(req, res) {
    try {
      const { aid, content, nickname, email, pid = 0 } = req.body;
      
      if (!aid || !content || !nickname) {
        return res.json(JsonReturn({
          code: 1,
          msg: '参数不完整'
        }));
      }

      if (content.trim().length < 5) {
        return res.json(JsonReturn({
          code: 1,
          msg: '评论内容至少5个字符'
        }));
      }

      // 验证文章是否存在
      const article = await Article.findOne({
        where: {
          id: aid,
          isshow: 1
        },
        attributes: ['id', 'comment_num']
      });

      if (!article) {
        return res.json(JsonReturn({
          code: 1,
          msg: '文章不存在'
        }));
      }

      // 如果是回复，验证父评论是否存在
      if (pid > 0) {
        const parentComment = await Comment.findOne({
          where: {
            id: pid,
            aid,
            isshow: 1
          }
        });

        if (!parentComment) {
          return res.json(JsonReturn({
            code: 1,
            msg: '父评论不存在'
          }));
        }
      }

      // 创建评论
      const commentData = {
        aid,
        content: content.trim(),
        nickname: nickname.trim(),
        email: email || '',
        pid,
        member_id: req.session?.member?.id || 0,
        ip: getClientIP(req),
        addtime: time(),
        isshow: 1 // 可以根据需要设置审核机制
      };

      const newComment = await Comment.create(commentData);

      // 更新文章评论数
      await article.increment('comment_num');

      res.json(JsonReturn({
        code: 0,
        msg: '评论发布成功',
        data: {
          id: newComment.id,
          content: newComment.content,
          nickname: newComment.nickname,
          addtime: formatTime(newComment.addtime)
        }
      }));

    } catch (error) {
      console.error('Comment API add error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '评论发布失败'
      }));
    }
  }

  // 点赞评论
  static async zan(req, res) {
    try {
      const commentId = parseInt(req.params.id);
      
      if (!commentId) {
        return res.json(JsonReturn({
          code: 1,
          msg: '评论ID无效'
        }));
      }

      const comment = await Comment.findOne({
        where: {
          id: commentId,
          isshow: 1
        },
        attributes: ['id', 'zan']
      });

      if (!comment) {
        return res.json(JsonReturn({
          code: 1,
          msg: '评论不存在'
        }));
      }

      // 增加点赞数
      await comment.increment('zan');

      res.json(JsonReturn({
        code: 0,
        msg: '点赞成功',
        data: {
          zan: comment.zan + 1
        }
      }));

    } catch (error) {
      console.error('Comment API zan error:', error);
      res.json(JsonReturn({
        code: 1,
        msg: '点赞失败'
      }));
    }
  }
}

module.exports = CommentApiController;