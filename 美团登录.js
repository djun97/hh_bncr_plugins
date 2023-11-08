/**
 * @author 小寒寒
 * @name 美团登录
 * @description 美团登录,美团脚本4.21更新：https://raw.githubusercontent.com/lu0b0/Script/main/mt.js
 * @rule ^(美团登录|登录美团|美团登陆|登陆美团)$
 * @rule ^https?:\/\/[a-zA-Z0-9]+\.meituan\.com\/[\S]*userId=[\d]+&(amp;)?token=[\S]+$
 * @version 1.0.7
 * @priority 1000
 * @admin false
 * @origin 小寒寒
 * @disable false
 */

const qlNum = 0; // 取哪个容器的ck
const envName = 'meituanCookie'; //适配萝卜和拉菲的脚本
module.exports = async (s) => {
    const QlMod = require('../红灯区/mod/AmQlMod.js');
    let qlDb = await QlMod.GetQlDataBase();
    let qlDbArr = qlDb['data'] || [];
    let url = '';
    if (qlDbArr.length == 0) return s.reply('请先发“面板管理”添加面板');
    const content = await s.getMsg();
    const im = await s.getFrom();
    if (['美团登录', '登录美团', '美团登陆', '登陆美团'].includes(content)) {
        await s.reply('请选择登录方式：\n1.网页登陆\n2.提交ck');
        let choiceIn = await s.waitInput(() => { }, 60);
        let choice = choiceIn?.getMsg() || '';
        if (choice == '1') {
            if (['qq', 'qqPD'].includes(im)) { //解决qq和频道屏蔽链接无法发送，改为发送二维码，qq请下载仓库提供的适配器支持发送图文消息
                const qr = 'https://apis.jxcxin.cn/api/qrcode?text=https://passport.meituan.com/useraccount/ilogin?';
                await s.reply({
                    type: 'image',
                    msg: '请扫描二维码，登录之后右上角复制链接',
                    path: qr
                })
            }
            else {
                await s.reply(`请访问以下链接，登录之后右上角复制链接：\nhttps://passport.meituan.com/useraccount/ilogin`);
            }
            await s.reply(`请在90秒内粘贴登录后的链接：`);
        }
        else if (choice == '2') {
            await s.reply(`请在90秒内输入抓取的ck，格式（userId=xxx;token=xxxx;)：`);
        }
        else{
            return await s.reply('已退出');
        }
        let input = await s.waitInput(() => { }, 90);
        url = input?.getMsg();
        if (!url || url == 'q' || url == 'Q') {
            return await s.reply('已退出');
        }
        s.delMsg(input.getMsgId());
    }
    else {
        url = content;
        s.delMsg(s.getMsgId());
    }
    url = url.replaceAll('&amp;', '&')
    console.log(url);
    if (/token=\S+/.test(url)) {
        let token = /(?<=token=).*(?=;)/.exec(url)?.toString() || getQueryString(url, 'token');
        let userid = /(?<=userId=).*(?=;)/.exec(url)?.toString() || getQueryString(url, 'userId');
        const userId = await s.getUserId();
        let remarks = userId + "@" + userid;
        let cookies = await QlMod.SearchQlEnvs(qlDbArr, qlNum, encodeURIComponent(remarks));
        if (cookies.data.length > 0) {
            let t = cookies.data[0];
            QlMod.EditQlEnvs(qlDbArr, qlNum, {
                "value": token, //变量
                "name": envName,   //变量名
                "remarks": t.remarks, //备注
                "id": t.id ? t.id : t._id  //id或_id
            });
            msg = `${userid}美团更新账号成功~`;
        } else {
            QlMod.AddQlEnvs(qlDbArr, qlNum, [{
                "value": token,
                "name": envName,   //变量名
                "remarks": remarks //备注
            }]);
            msg = `${userid}美团上车成功~`;
        }
        await s.reply(msg);
    }
    else {
        await s.reply(`输入的链接有误，请重新登录提取！`);
    }
}

function getQueryString(url, name) {
    let reg = new RegExp('(^|&|)' + name + '=([^&]*)(&|$)', 'i');
    let r = url.match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return '';
}