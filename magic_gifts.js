/**
 * @author 小寒寒
 * @name magic_gifts
 * @origin 小寒寒
 * @version 1.1.0
 * @description 查询gifts.csv 命令：查实物 10
 * @rule ^查询实物 ([\d]+)$
 * @rule ^查实物 ([\d]+)$
 * @admin true
 * @public false
 * @priority 1000
 */

//HumanTG、pgm适配器请升级至最新版


/* HideStart */
const jsonSchema = BncrCreateSchema.object({
    qlNums: BncrCreateSchema.array(BncrCreateSchema.number()).setTitle('容器序号').setDescription(`取哪个容器，支持多个，从0开始`).setDefault([0]),
    qlScript: BncrCreateSchema.string().setTitle('对应库名').setDescription('取哪个库的gitfs').setDefault("walle1798_EVE"),
    delMsgTime: BncrCreateSchema.number().setTitle('消息撤回时间').setDescription(`自定义实物消息撤回时间，秒数`).setDefault(20),
});

const ConfigDB = new BncrPluginConfig(jsonSchema);

//插件入口
module.exports = async s => {
    await ConfigDB.get();
    // console.log('ConfigDB.userConfig', ConfigDB.userConfig);
    if (!Object.keys(ConfigDB.userConfig).length) {
        return await s.reply('请先发送"修改无界配置",或者前往前端web"插件配置"来完成插件首次配置');
    }
    const qlNums = ConfigDB.userConfig.qlNums; // 取哪个容器
    const qlScript = ConfigDB.userConfig.qlScript; // 取哪个库的 gitfs.csv，二选一
    //const qlScript = 'walle1798_WALL.E'; // 取哪个库的gitfs.csv，二选一
    const delMsgTime = ConfigDB.userConfig.delMsgTime; // 自定义实物消息撤回时间，秒数

    const QlMod = require('../红灯区/mod/AmQlMod.js');
    const request = require('util').promisify(require('request'));
    let qlDb = await QlMod.GetQlDataBase();
    let qlDbArr = qlDb['data'] || [];
    if (qlDbArr.length == 0) return s.reply('请先发“面板管理”添加面板');
    const AmingScriptQl = new BncrDB('AmingScriptQl');
    for (let qlNum of qlNums) {
        console.log('青龙版本：' + JSON.stringify(await QlMod.GetQlVersion(qlDbArr, qlNum)));
        const ql_token = (await AmingScriptQl.get(`${qlDbArr[qlNum].ClientID}_token`)).token;

        let giftsData = await request({
            url: `${qlDbArr[qlNum].Host}/open/scripts/gifts.csv?path=${qlScript}`,
            headers: {
                'Authorization': `Bearer ${ql_token}`
            },
            method: 'get',
            json: true
        });
        if (giftsData.body?.data) {
            let gifts = giftsData.body.data;
            let lines = gifts.split(/\r?\n/);
            console.log(`共计${lines.length}个实物`);
            lines = lines.reverse();
            let msg = [];
            const num = Number(s.param(1));
            if (num == 0) {
                return s.delMsg(await s.reply('命令错误，请重新输入！'), { wait: 10 });
            }
            for (let t of lines || []) {
                if (msg.length == num) {
                    break;
                }
                let item = t.split(',');
                if (item[0] && !item.includes('M试用有礼')) {
                    let message = `${msg.length + 1}. ${item[1]}，${item[2].slice(0, 2)}***${item[2].slice(-1)}，${item[5]}，${item[0].slice(0, 19)}`;
                    if (['pgm', 'HumanTG'].includes(s.getFrom())) {
                        message += `，[活动地址](https://www.yanyuwangluo.cn/jd/?url=${item[7]})`;
                    }
                    else {
                        message += `，活动地址：${item[7]}`;
                    }
                    msg.push(message);
                }
            }
            if (msg.length == 0) {
                s.delMsg(await s.reply('你都没有中实物，你是非洲人吗~'), { wait: 10 });
            }
            else {
                s.delMsg(s.getMsgId());
                if (['pgm', 'HumanTG'].includes(s.getFrom())) {
                    s.delMsg(await s.reply({
                        msg: `${msg.join('\n')}`,
                        type: 'markdown'
                    }), { wait: 10 });
                }
                else {
                    s.delMsg(await s.reply(msg.join('\n')), { wait: delMsgTime });
                }
            }
        }
        else {
            s.delMsg(await s.reply('gifts.csv文件不存在'), { wait: 10 });;
        }

        await sysMethod.sleep(3);
    }
};
/* HideEnd */