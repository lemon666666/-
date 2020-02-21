// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
      data: {
        thing4: {
          value: '评论通知'
        },
        thing2: {
          value: event.content
        }
      },
      templateId: 'vPpt4oKXNzJiL5qzBqhCnkPz1CcHTJDPHXXABaEnixM',
    })

    return result

  } catch (error) {
     return error
  }
}