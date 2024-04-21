/**
 * @author IP变化通知
 * @name IP变化通知
 * @origin 小寒寒
 * @version 1.0.2
 * @rule ^IP变化通知$
 * @description IP变化通知，变化后自动执行代理“更换白名单”命令，多线路的请勿使用
 * @admin true
 * @public false
 * @priority 1000
 * @cron 0 *\/3 * * * *
 * @disable false
 */


const url = "https://apis.jxcxin.cn/api/bjip";
const request = require('util').promisify(require('request'));
module.exports = async s => {
    const djunDB = new BncrDB('djunDB');
    let ip = await djunDB.get('local_ip');
    let data = await request({
        url: url,
        method: 'get'
    });
    let newip = data.body;
    // console.log(newip);
    if (newip.split('.').length != 4) {
        return;
    }
    if (ip) {
        if (newip && newip != ip) {
            // console.log(newip);
            await djunDB.set('local_ip', newip);
            await sysMethod.pushAdmin({
                platform: ['tgBot', 'wxQianxun'],
                type: 'text',
                msg: "【IP变更通知】\n上次IP：" + ip + "\n当前IP：" + newip + "\n开始执行【更换白名单】命令"
            });
            sysMethod.inline('更换白名单');
        }
    }
    else {
        await djunDB.set('local_ip', newip);
    }
}
