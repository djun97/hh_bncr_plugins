/**
 * This file is part of the Bncr project.
 * @author 小寒寒
 * @name wxGGbon
 * @origin Bncr团队
 * @version 1.0.1
 * @description wxGGbon适配器
 * @adapter true
 * @public false
 * @disable false
 * @priority 2
 * @Copyright ©2023 Aming and Anmours. All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */
const jsonSchema = BncrCreateSchema.object({
  enable: BncrCreateSchema.boolean().setTitle('是否开启适配器').setDescription(`设置为关则不加载该适配器`).setDefault(false),
  sendUrl: BncrCreateSchema.string().setTitle('上报地址').setDescription(`无界收到消息要发送到的url`).setDefault(''),
});
/* 配置管理器 */
const ConfigDB = new BncrPluginConfig(jsonSchema);
module.exports = async () => {
  /* 读取用户配置 */
  await ConfigDB.get();
  /* 如果用户未配置,userConfig则为空对象{} */
  if (!Object.keys(ConfigDB.userConfig).length) {
      sysMethod.startOutLogs('未启用GGbon适配器,退出.');
      return;
  }
  if (!ConfigDB.userConfig.enable) return sysMethod.startOutLogs('未启用GGbon 退出.');
  let GGbonUrl = ConfigDB.userConfig.sendUrl;
  if (!GGbonUrl) return console.log('千寻:配置文件未设置sendUrl');
  //这里new的名字将来会作为 sender.getFrom() 的返回值
  const wxGGbon = new Adapter('wxQianxun');
  // 包装原生require   你也可以使用其他任何请求工具 例如axios
  const request = require('util').promisify(require('request'));
  const qs = require('querystring');
  const iconv = require('iconv-lite');
  // wx数据库
  const wxDB = new BncrDB('wxQianxun');
  let botId = await wxDB.get('qianxun_botid', ''); //自动设置，无需更改
  /**向/api/系统路由中添加路由 */
  router.get('/api/bot/GGbon', (req, res) =>
      res.send({ msg: '这是Bncr GGbon Api接口，你的get请求测试正常~，请用post交互数据' })
  );
  router.post('/api/bot/GGbon', async (req, res) => {
      try {
          // console.log(req.body);
          let body = decodeURIComponent(qs.stringify(req.body)).match(/\{.*\}/)[0];
          body = JSON.parse(body);
          if (botId !== body.wxid)
              /* 另一种set数据库操作，第三个值必须为一个对象，传入def字段时，设置成功返回def设置的值*/
              botId = await wxDB.set('qianxun_botid', body.wxid, { def: body.wxid });

          // console.log('消息类型:', body.data.data.msgType);

          /**
           * 消息类型：1|文本 3|图片 34|语音 42|名片 43|视频 47|
           * 动态表情 48|地理位置 49|分享链接或附件 2001|
           * 红包 2002|小程序 2003|群邀请 10000|系统消息
           */
          let msg = iconv.decode(Buffer.from(body.data.data.msgBase64.replaceAll(' ', '+'), 'base64'), 'GBK').toString();
          //自动同意好友 仅适用于GGG
          // if (body.event === 10009 && body.data.data.msgType == 37) {
          //     console.log('收到好友请求：' + msg);
          //     await sysMethod.sleep(3);
          //     let v3 = msg.match(/v3\_[a-z0-9]+\@stranger/)[0];
          //     let v4 = msg.match(/v4\_[a-z0-9]+\@stranger/)[0];
          //     let scene = msg.match(/(?<=scene=\")\d{1,2}(?=\")/)[0];
          //     let body = await request({
          //         url: `${GGbonUrl}`,
          //         method: 'post',
          //         body: { api: 7, v3, v4, scene },
          //         json: true
          //     })
          //     console.log('自动同意好友结果：', body.body);
          //     return res.send({ status: 200, data: '', msg: 'ok' });
          // }
          if (![1, 49, 2002].includes(body.data.data.msgType)) return `拒收该消息:${body.msg}`;
          let msgInfo = null;
          // console.log(msg);
          //私聊
          if (body.event === 10009 && body.data.data.fromType === 1) {
              msgInfo = {
                  userId: body.data.data.fromWxid || '',
                  userName: '',
                  groupId: '0',
                  groupName: '',
                  msg: msg || '',
                  msgId: body.data.data.msgBase64 || '',
                  fromType: `Social`,
              };
              //群
          } else if (body.event === 10008 && body.data.data.fromType === 2) {
              msgInfo = {
                  userId: body.data.data.finalFromWxid || '',
                  userName: '',
                  groupId: body.data.data.fromWxid.replace('@chatroom', '') || '0',
                  groupName: '',
                  msg: msg || '',
                  msgId: body.data.data.msgBase64 || '',
                  fromType: `Social`,
              };
          }

          msgInfo && wxGGbon.receive(msgInfo);
          res.send({ status: 200, data: '', msg: 'ok' });
      } catch (e) {
          console.error('千寻消息接收器错误:', e);
          res.send({ status: 400, data: '', msg: e.toString() });
      }
  });

  wxGGbon.reply = async function (replyInfo) {
      // console.log('replyInfo', replyInfo);
      let body = null;
      const to_Wxid = +replyInfo.groupId ? replyInfo.groupId + '@chatroom' : replyInfo.userId;
      switch (replyInfo.type) {
          case 'text':
              replyInfo.msg = replyInfo.msg.replace(/\n/g, '\r');
              body = {
                  type: "Q0001",
                  data: {
                      wxid: to_Wxid,
                      msg: replyInfo.msg
                  }
              };
              break;
          case 'image':
          case 'video':
              body = {
                  type: "Q0010",
                  data: {
                      wxid: to_Wxid,
                      path: replyInfo.path
                  }
              };
              break;
          default:
              return;
              break;
      }
      body && (await requestGGbon(body));
      // console.log('body', body);
      return ''; //reply中的return 最终会返回到调用者 wx没有撤回方法，所以没有必要返回东西
  };
  /* 推送消息方法 */
  wxGGbon.push = async function (replyInfo) {
      return this.reply(replyInfo);
  };
  /* wx无法撤回消息 为空 */
  wxGGbon.delMsg = () => { };
  /* 发送消息请求体 */
  async function requestGGbon(body) {
      return (
          await request({
              url: `${GGbonUrl}/DaenWxHook/httpapi/?wxid=${botId}`,
              method: 'post',
              body: body,
              json: true
          })
      ).body;
  }
  return wxGGbon;
};
