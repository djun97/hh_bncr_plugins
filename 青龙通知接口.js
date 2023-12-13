/**
 * @author 小寒寒
 * @name 青龙通知接口
 * @origin 小寒寒
 * @version 1.1.1
 * @description 青龙通知接口，根据通知标记活动，适配于麦基EVE库，搭配库里SpyIsValid使用，需配置对接token，set SpyIsValid ql_token xxxx，自行需要修改推送群号 不能其它通知接口插件共用
 * @public false
 * @priority 99
 * @disable false
 * @service true
 * 
 * 
 * 1.0.4 适配积分兑换，增加更多垃圾活动标记，优化日期处理
 * 1.0.5 修复bug
 * 1.0.6 优化及调整
 * 1.0.7 协助作者收集高质量活动店铺ID 80-94
 * 1.0.8 垃圾或领完只根据ck1的判断来标记，减少标记错误的可能性，新增仅需执行一次的活动标记
 * 1.0.9 增加M粉丝互动定时
 * 1.1.0 代码及标记判断优化，修复部分bug
 * 1.1.1 增加使用go-cqhttp通知接口的方式来对接，具体查看apiMode变量，用于解决麦基脚本无法通知的问题
 */

// 指定标题推送
const push1 = {
    platform: 'wxQianxun', // 平台
    groupId: 49230877656, // 群号
    notify: true // 通知开关
}
const title1 = ['东东农场',
    '京东价保',
    '互动消息检查',
    'M银行卡支付有礼',
    'M农场自动化',
    '京东试用待领取物品通知',
    '牛牛乐园合成',
    // 'M京东签到',
    '东东农场日常任务',
    '京东调研问卷',
    '京东白嫖提醒',
    '京东资产统计cookie已失效',
    '新农场任务',
    // '京东CK检测',
    // 'WSKEY转换',
]

// 豆豆通知
const push2 = {
    platform: 'wxQianxun', // 平台
    userId: 'jun812148374', // 个人
    notify: true // 通知开关
}

//青龙全部通知
const push3 = {
    platform: 'tgBot', // 平台
    groupId: -1001805030658, // 群号
    notify: true // 通知开关
}

// 仅需执行一次的活动标记，如需再次运行请使用Spy立即运行命令
const onlyTitles = ['M分享有礼', 'M试用有礼', 'M邀请有礼WX', 'M邀请有礼JOY', 'M邀请有礼JINGGENG', 'M邀请有礼INTERACT'];

// SpyIsValid相关功能，默认开启
const spyIsValidEnable = true;

// 1用bncr接口 export BncrHost="http://192.168.2.5:9090" export BncrToken="token"
// 2用go-cqhttp接口 export GOBOT_URL="http://192.168.2.5:9090/api/qinglongMessage" export GOBOT_TOKEN="token"
// 2选1，用其中一个需把另外一个变量设置为空
const apiMode = 2; 

const SpyIsValid = new BncrDB('SpyIsValid');
const dayjs = require('dayjs');
/* post接口 */
router.post('/api/qinglongMessage', async (req, res) => {
    try {
        const setToken = await SpyIsValid.get('ql_token', null);
        if (!setToken) return res.send({ code: 401, data: '', msg: '未设置token，拒绝访问' });
        let { title, message, token } = req?.body;
        if (apiMode == 1) {
            if (token !== setToken) return res.send({ code: 400, data: '', msg: '青龙BncrToken与Bncr setToken不一致' });
        }
        else {
            title = message.split('\n')[0];
            message = message.replace(title + '\n', '');
        }
        // /* 标题 */
        // console.log('title', title);
        // /* 推送日志 */
        // console.log('message', message);
        //关键活动推韭菜群
        if (title1.includes(title) && push1.notify) {
            await sysMethod.push({
                platform: push1.platform, // 平台
                groupId: push1.groupId, // 群号
                msg: `${title}\n\n${message}`,
                type: 'text'
            });
        }
        //订阅变更和豆豆推个人微信
        if (/(新增任务|删除任务)/.test(title)
            || (/\d+】\S*\d+(京豆|元E卡)/.test(message) && !['M签到有礼', 'M京东签到'].includes(title))
            || (/天,\d+(京豆|元E卡)/.test(message) && title == 'M签到有礼')
            || (/,已填地址/.test(message) && !['M积分兑换', 'M试用有礼'].includes(title))
        ) {
            if (push2.notify) {
                await sysMethod.push({
                    platform: push2.platform, // 平台
                    userId: push2.userId, // 个人id
                    msg: `${title}\n\n${message}`,
                    type: 'text'
                });
            }
        }

        // M麦基脚本日志判断
        if (message.includes('export ') && title[0] == 'M' && spyIsValidEnable) {
            let exptPattern = /export \S+=\"\S+\"/;
            let expt = exptPattern.exec(message)?.toString();

            let url = /https:\/\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\*\+,%;\=]*/.exec(expt)?.toString();
            if (url) {
                // 获取活动ID
                let activityId = getQueryString(url, 'activityId') || getQueryString(url, 'id')
                    || getQueryString(url, 'giftId') || getQueryString(url, 'actId')
                    || getQueryString(url, 'code')
                    || getQueryString(url, 'a');
                // 当前时间
                const nowDate = new Date();
                if (activityId) {
                    // 通知追加活动id
                    message += `\n活动ID：${activityId}`
                    // 取SpyIsValid活动标记
                    const actCron = await SpyIsValid.get(activityId, '');
                    // 定时提前秒数
                    const timer_before = await SpyIsValid.get('timer_before', 0);
                    if (title == 'M购物车锦鲤' && /已经开奖/.test(message)) { // 购物车开奖标记
                        await SpyIsValid.set(activityId, '已经开奖');
                        message += `\n\nBncr已标记：已经开奖`;
                    }
                    else if (/(活动已过期|活动已结束|活动已经结束|商家token过期|超出活动计划时间)/.test(message)) { // 过期活动标记
                        await SpyIsValid.set(activityId, '活动已结束');
                        message += `\n\nBncr已标记：活动已结束`;
                    }
                    else if (/(垃圾或领完|垃圾活动|才能参与抽奖|已达到活动期间最大抽奖次数|没有豆子|奖品已经?发完|礼包已经不存在)/.test(message) && !/设置了前\d+不能抽奖跳出/.test(message)) { // 垃圾活动标记，但抽奖跳出的也会判断垃圾或领完，故剔除
                        await SpyIsValid.set(activityId, '垃圾或领完');
                        message += `\n\nBncr已标记：垃圾或领完`;
                    }
                    else if (/(未开始|明日再来)/.test(message)) { // 未开始或明日再来活动定时
                        if (!actCron) {
                            let datePattern = /\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}(:\d{2})?\s?(至|\-)/;
                            let rlt = datePattern.exec(message)?.toString();
                            if (rlt) {
                                let startTime = dayjs(rlt.slice(0, 16) + ':00');
                                if (title == 'M加购有礼' && /明日再来/.test(message)) { // 明日加购
                                    startTime = dayjs().startOf('day').add(1, 'day');
                                }
                                else if (title == 'M每日领奖') { // 每日领好礼
                                    let recTime = /领奖时间:\d{2}:\d{2}/.exec(message)?.toString() || '';
                                    if (/活动未开始/.test(message)) { // 活动未开始
                                        startTime = dayjs(startTime.format('YYYY-MM-DD') + ' ' + recTime.slice(-5) + ':00');
                                    }
                                    else { // 领取时间未到
                                        startTime = dayjs(dayjs().format('YYYY-MM-DD') + ' ' + recTime.slice(-5) + ':00');
                                    }
                                }
                                if (startTime['$d'].getTime() > nowDate.getTime()) { // 判断定时是否大于当前时间
                                    startTime = startTime.subtract(timer_before, 'second');
                                    const cron = startTime.format('s m H D M *');
                                    await sysMethod.inline(`spy定时插队 ${cron} ${expt}`);
                                    await SpyIsValid.set(activityId, startTime['$d'].getTime());
                                    message += '\n\nBncr设置定时：' + cron;
                                }
                            }
                        }
                        else {
                            message += '\n\nBncr已定时过了。';
                        }
                    }
                    else if (/兑\d:false/.test(message) && title == 'M粉丝互动') { // M粉丝互动
                        if (!actCron) {
                            let startTime = dayjs().startOf('day').add(1, 'day').subtract(timer_before, 'second');
                            let cron = startTime.format('s m H D M *');
                            await sysMethod.inline(`spy定时插队 ${cron} ${expt}`);
                            await SpyIsValid.set(activityId, startTime['$d'].getTime());
                            message += '\n\nBncr设置定时：' + cron;
                        }
                        else {
                            message += '\n\nBncr已定时过了。';
                        }
                    }
                    else if (title == 'M购物车锦鲤' && /开奖时间:/.test(message)) { // M购物车锦鲤 开奖定时
                        if (!actCron) {
                            let datePattern = /开奖时间:\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}/;
                            let rlt = datePattern.exec(message)?.toString();
                            if (rlt) {
                                let startTime = dayjs(rlt.slice(-16) + ':00').subtract(timer_before, 'second');
                                let cron = startTime.format('s m H D M *');
                                await sysMethod.inline(`spy定时插队 ${cron} ${expt}`);
                                await SpyIsValid.set(activityId, startTime['$d'].getTime());
                                message += '\n\nBncr设置定时：' + cron;
                            }
                        }
                        else {
                            message += '\n\nBncr已定时过了。';
                        }

                    }
                    else if (onlyTitles.includes(title) || /(该活动仅可成功参与一次|已经组满)/.test(message)) { // 仅需执行一次的活动标记
                        await SpyIsValid.set(activityId, `${title}仅执行一次`);
                        message += `\n\nBncr已标记：仅可执行一次。`;
                    }
                }
            }
        }
        // tg推送全部日志
        if (push3.notify) {
            await sysMethod.push({
                platform: push3.platform,
                groupId: push3.groupId, // tg青龙日志群
                msg: `${title}\n\n${message}`,
                type: 'text'
            });
        }

        /* 返回结果 */
        return res.send({ code: 200, data: '', msg: 'ok' , retcode: 0 });
    } catch (e) {
        console.log(e);
        res.send({ code: 400, data: '', msg: '参数有误！' });
    }
});

/* get接口 */
router.get('/api/qinglongMessage', async (req, res) => {
    res.send('Bncr青龙消息通知接口');
});

function getQueryString(url, name) {
    let reg = new RegExp('([?&])' + name + '=([^&]+)');
    let r = url.match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return '';
}