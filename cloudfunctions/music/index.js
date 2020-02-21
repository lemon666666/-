const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router')

const rp = require('request-promise')

const BASE_URL = 'http://musicapi.xiecheng.live'

// 初始化 cloud
cloud.init()

const db = cloud.database()
/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
    const app = new TcbRouter({event})

    //首页音乐列表路由
    app.router('playlist', async (ctx, next) => {
        //获取歌单数据渲染
        ctx.body = await db.collection('getplaylist')
        .skip(event.start)
        .limit(event.count)
        .orderBy('createTime','desc')
        .get()
        .then(res => {
            return res
        })
    })

    //获取音乐歌单中的歌曲
    app.router('musiclist', async (ctx, next) => {
      ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId))
        .then(res => {
            return JSON.parse(res)
        })
    })

    //获取播放歌曲
    app.router('musicUrl',async (ctx,next) => {
      ctx.body = await rp(BASE_URL + `/song/url?id=${event.musicId}`)
        .then(res => {
            return res
        })
    })

    //获取歌词
    app.router('lyric',async (ctx,next) => {
      ctx.body = await rp(BASE_URL + `/lyric?id=${event.musicId}`)
        .then(res => {
            return res
        })
    })

    return app.serve()
}