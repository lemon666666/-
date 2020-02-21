const cloud = require('wx-server-sdk')
const request = require('request-promise')
cloud.init()
//使用云数据库初始化
const db = cloud.database()

//获取歌曲接口
const URL = 'http://musicapi.xiecheng.live/personalized'

//获取插入的歌曲数据集合  
const playCollection = db.collection('getplaylist')
//云端查询数据最大限制100条
const MAX_LIMIT = 100


exports.main = async (event, context) => {

    //获取歌单数据
   // const list = await playCollection.get()
    // 小程序获取只有20条，突破限制分批获取  分批获取数据
    //1.先取出集合记录总数
    const count = await playCollection.count()
    const total = count.total
    //2.计算需分几次取
    const batchTimes = Math.ceil(total/MAX_LIMIT)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
        const promise = playCollection.skip(i*MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
    }
   
    //获取原先数据库的数据
   var list = {
       data:[]
   }
   if(tasks.length > 0){
      list = (await Promise.all(tasks)).reduce((acc,cur)=>{
          return{
              data:acc.data.concat(cur.data)
          }
      })
   }

    const playlist = await request(URL).then(res => {
        return JSON.parse(res).result    //将字符串解析成对象
    })
    console.log(playlist)   //打印返回对象

    //判断是否已经插入   去重
    const newData = [];
    for (let i = 0; i < playlist.length; i++) {
        let flag = true;//判断数据是否重复  true 不重复
        for (let j = 0; j < list.data.length; j++) {
           if(playlist[i].id === list.data[j].id){
                flag = false;
                break;  //结束本次循环
           }
           if(flag){
               newData.push(playlist[i])
           }
        }
    }
    
    //数据库操作  
    for (let i = 0; i < playlist.length; i++) {
        //将歌单插入数据库
        await playCollection.add({
            data:{
                ...playlist[i],   //newData中每个值
                createTime: db.serverDate()
            }
        }).then(res => {
            console.log('插入成功')
        }).catch(err => {
            console.log('插入失败')
        })
    }

    return newData.length
}