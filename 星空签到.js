/**
 * @author 小寒寒
 * @name 星空签到
 * @origin 小寒寒
 * @version 1.0.0
 * @description 星空签到
 * @rule ^(星空签到)$
 * @priority 99999
 * @cron 0 0 8,22 * * *
 * @admin true
 * @disable false
 */

const axios = require('axios')
const qs = require('qs');

const jsonSchema = BncrCreateSchema.object({
    xkDB: BncrCreateSchema.array(BncrCreateSchema.object({
        phone: BncrCreateSchema.string().setTitle('手机号').setDescription('星空注册时的手机号').setDefault(''),
        pwd: BncrCreateSchema.string().setTitle('密码').setDescription('星空注册时的密码').setDefault(''),
        enable: BncrCreateSchema.boolean().setTitle('启用').setDescription('是否启用').setDefault(true),
    })).setTitle('星空账号').setDescription(`点击+号添加需要签到的账号`).setDefault([]),
});

const ConfigDB = new BncrPluginConfig(jsonSchema);

module.exports = async s => {
    await ConfigDB.get();
    // console.log('ConfigDB.userConfig', ConfigDB.userConfig);
    if (!Object.keys(ConfigDB.userConfig).length) {
        return await s.reply('请先发送"修改无界配置",或者前往前端web"插件配置"来完成插件首次配置');
    }
    let accounts = ConfigDB.userConfig.xkDB?.filter(o => o.enable) || [];
    if (accounts.length == 0) {
        return s.reply('当前没有账号,请添加账号后重试')
    }
    else {
        for (let item of accounts) {
            let cookie = await login(item.phone, item.pwd)
            await s.reply(`${phoneNuberConvert(item.phone)}: ${cookie.msg ? cookie.msg : await sign(cookie)}`)
        }
    }
}

async function login(username, password) {
    let options = {
        url: 'https://www.xkdaili.com/tools/submit_ajax.ashx?action=user_login&site_id=1',
        method: 'post',
        data: qs.stringify({
            'username': username,
            'password': password,
            'remember': '1',
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
            Origin: 'https://www.xkdaili.com',
            Referer: 'https://www.xkdaili.com/'
        }
    }
    let res = await axios(options)
    console.log(res.data);
    return res && res.data.status === 1 ? res.headers['set-cookie'].map(t => t.split(';')[0]).join('; ') : res.data
}

async function sign(cookie) {
    let options = {
        url: 'https://www.xkdaili.com/tools/submit_ajax.ashx?action=user_receive_point',
        method: 'post',
        data: qs.stringify({
            type: 'login'
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
            Origin: 'https://www.xkdaili.com',
            Referer: 'https://www.xkdaili.com/',
            Cookie: cookie
        }
    }
    let res = await axios(options)
    console.log(res.data)
    return res && res.data.status === 1 ? '签到成功' : res.data.msg
}

function phoneNuberConvert(number) {
    if (!number) return '';
    let pat = /(\d{3})\d*(\d{4})/;
    let result = number.replace(pat, "$1****$2");
    return result;
}