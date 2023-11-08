/**
 * @author 小寒寒
 * @name 京东对时
 * @origin 小寒寒
 * @version 1.0.0
 * @description 京东对时
 * @rule ^京东对时$
 * @priority 1000
 * @admin true
 * @disable false
 * */
module.exports = async s => {
    const request = require('util').promisify(require('request'));
    const dayjs = require('dayjs');
    let data = await request({
        url: `https://sgm-m.jd.com/h5/`,
        method: 'get',
        json: true
    });
    s.delMsg(await s.reply(`本地时间：${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')}\n京东时间：${dayjs(data.body.timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')}`), { wait: 10 });
}