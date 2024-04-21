/**
 * This file is part of the App project.
 * @author 小寒寒
 * @name wechaty
 * @origin Bncr团队
 * @version 1.0.0
 * @description wx机器人适配器
 * @adapter true
 * @public false
 * @disable false
 * @priority 100
 * @Copyright ©2024 Aming and Anmours. All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

/* 配置构造器 */
const jsonSchema = BncrCreateSchema.object({
    enable: BncrCreateSchema.boolean().setTitle('是否开启适配器').setDescription(`设置为关则不加载该适配器`).setDefault(false),
    name: BncrCreateSchema.string().setTitle('机器人标识').setDescription(`设置后后续自动登录，更换微信时请更换标识`).setDefault('wechaty'),
    accept: BncrCreateSchema.boolean().setTitle('自动同意好友申请').setDescription(`设置后自动同意微信好友申请`).setDefault(true),
    hello: BncrCreateSchema.string().setTitle('好友验证消息').setDescription(`设置后需要验证消息后才会自动同意好友`).setDefault('')
});

/* 配置管理器 */
const ConfigDB = new BncrPluginConfig(jsonSchema);
module.exports = async () => {
    /* 读取用户配置 */
    await ConfigDB.get();
    /* 如果用户未配置,userConfig则为空对象{} */
    if (!Object.keys(ConfigDB.userConfig).length) {
        sysMethod.startOutLogs('未配置wechaty适配器,退出.');
        return;
    }
    if (!ConfigDB.userConfig.enable) return sysMethod.startOutLogs('未启用wechaty 退出.');
    const robotName = ConfigDB.userConfig.name || 'wechaty';
    const accept = ConfigDB.userConfig.accept || true;
    const hello = ConfigDB.userConfig.hello || '';
    /** 定时器 */
    let timeoutID = setTimeout(() => {
        throw new Error('wechaty登录超时,放弃加载该适配器');
    }, 2 * 1000 * 60);
    let wx = new Adapter('wechaty');
    /* 补全依赖 */
    await sysMethod.testModule(['wechaty', 'wechaty-plugin-contrib'], { install: true });
    const { WechatyBuilder, types, log } = require('wechaty');
    log.level('info')
    const { QRCodeTerminal } = require('wechaty-plugin-contrib');
    const { FileBox } = require('file-box')
    const bot = WechatyBuilder.build({ name: robotName });

    // /* 注入发送消息方法 */
    wx.reply = async function (replyInfo, sendRes = '') {
        try {
            const contact = replyInfo.groupId != "0" ? await bot.Room.find({ topic: Buffer.from(replyInfo.groupId, 'hex').toString('utf-8') }) : await bot.Contact.find({ name: Buffer.from(replyInfo.userId, 'hex').toString('utf-8') });
            if (replyInfo.type === 'text') {
                sendRes = await contact.say(replyInfo.msg);
            }
            else if (['image', 'video'].includes(replyInfo.type)) {
                const fileType = replyInfo.type == 'image' ? '.png' : '.mp4'
                const file = FileBox.fromUrl(replyInfo.path, Date.now() + fileType);
                sendRes = await contact.say(file);
            }
            return sendRes ? sendRes.id : '0';
        } catch (e) {
            console.error('wechaty：发送消息失败', e);
        }
    };
    wx.push = async function (replyInfo, send = '') {
        return this.reply(replyInfo);
    };

    // /* 注入删除消息方法 */
    wx.delMsg = async function (argsArr) {
        try {
            return true;
        } catch (e) {
            return false;
        }
    };

    bot.on('scan', (qrcode, status) => {
        sysMethod.startOutLogs(`wechaty: 正在登录，${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`);
    });

    bot.on('login', (user) => {
        sysMethod.startOutLogs(`wechaty：${user} 登录成功`);
    });

    bot.on('friendship', async friendship => {
        console.log("wechaty：收到微信好友申请事件");
        if (friendship.type() === types.Friendship.Receive && (friendship.hello() === hello || hello == "") && accept) {
            await friendship.accept();
        }
    });

    // 心跳，防止掉线
    bot.on('heartbeat', async data => {
        try {
            const contact = await bot.Contact.find({ name: "文件传输助手" });
            await contact.say("[爱心]")
        }
        catch{}
    });

    bot.on('message', async message => {
        try {
            const contact = message.talker();
            if (contact.self()) return; // 屏蔽自己的消息
            const room = message.room();
            let msgInfo = {
                userId: Buffer.from(contact.payload.name, 'utf-8').toString('hex') || '',
                userName: contact.payload.name || '',
                groupId: room ? Buffer.from(room.payload.topic, 'utf-8').toString('hex') : '0',
                groupName: room ? room.payload.topic : '',
                msg: message.payload.text || '',
                msgId: message.payload.id || '',
            };
            // console.log(msgInfo);
            wx.receive(msgInfo);
        } catch (e) {
            console.log('wechaty接收器报错:', e);
        }
    });

    bot.use(QRCodeTerminal({ small: true }))
    bot.start();

    clearTimeout(timeoutID);
    return wx;
};
