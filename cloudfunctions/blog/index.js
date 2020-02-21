const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()

const TcbRouter = require('tcb-router')
//在服务端获取数据库不需要wx命名空间 ,否则上传后调用将报错
const db = cloud.database()
const blogCollection = db.collection('blog')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})

  app.router('list', async (ctx, next) => {
   const keyword = event.keyword
   let w = {}
   if(keyword.trim() != ''){
    w = {
      content: db.RegExp({
        regexp: keyword,
        options: 'i'
      })
    }
   }
   let blogList = await blogCollection.where(w).skip(event.start).limit(event.count).orderBy('createTime', 'desc').get().then(res => {
     return res.data
   })
   ctx.body = blogList
  })

  app.router('detail', async(ctx, next) => {
    let blogId = event.blogId
    //查询blogId用户
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then(res => {
      return res.data
    })
    //评论查询  每次100条分次查询
    const countResult = await blogCollection.count()
    const total = countResult.total
    let commentList = {
      data: []
    }
      const batchTimes = Math.ceil(total / MAX_LIMIT)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        let promise = db.collection('blog-comment').skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
          blogId
        }).orderBy('createTime','desc').get()
        tasks.push(promise)
      }
      if(tasks.length > 0){
        commentList = (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data)
          }
        })
      }

    ctx.body = {
      commentList,
      detail
    }
  })

  //我的发现
  //获取当前用户openid
  const wxContext = cloud.getWXContext()
  app.router('getBlogHistory', async(ctx, next) => {
   ctx.body = await blogCollection.where({
      _openid: wxContext.OPENID
    }).skip(event.start).limit(event.count).orderBy('createTime','desc').get().then(res => {
      return res.data
    })
  })

  return app.serve()
}