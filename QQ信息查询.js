/**
 * @author 小寒寒
 * @name QQ信息查询
 * @origin 小寒寒
 * @version 1.0.0
 * @description 查Q绑 查LOL
 * @public false
 * @priority 99
 * @disable false
 * @admin false
 * @rule ^(查Q绑|查q绑|查lol|查LOL) ([0-9A-Za-z]+)$
 * */

const qqDb = new BncrDB('qq');
const request = require('util').promisify(require('request'));
module.exports = async s => {
    const qq = s.param(2);
    if (qq == (await qqDb.get("admin", ""))) {
        return await s.reply(`禁止查管理员QQ！`);
    }
    else {
        const rule = s.param(1);
        if (['查Q绑', '查q绑'].includes(rule)) {
            let { body } = await request({
                url: "https://zy.xywlapi.cc/qqapi?qq=" + qq,
                //请求链接
                method: "get",
                //请求方法
                json: true,
                //返回json
            });
            console.log(body);
            if (body.status == 200) {
                await s.reply(`QQ号：${body.qq}\n手机号：${body.phone}\n归属地：${body.phonediqu}`)
            }
            else {
                await s.reply(body.message);
            }
        }
        else {
            let { body } = await request({
                url: "https://zy.xywlapi.cc/qqlol?qq=" + qq,
                //请求链接
                method: "get",
                //请求方法
                json: true,
                //返回json
            });
            console.log(body);
            if (body.status == 200) {
                await s.reply(`QQ号：${body.qq}\n游戏名：${body.name}\n游戏大区：${body.daqu}`)
            }
            else {
                await s.reply(body.message);
            }
        }
    }
}
