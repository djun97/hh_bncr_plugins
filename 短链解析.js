/**
 * @author 小寒寒
 * @name 短链解析
 * @origin 小寒寒
 * @version 1.0.4
 * @description 短链解析
 * @rule https?:\/\/jd\.lsy22\.cn\/[0-9A-Za-z]{3,8}
 * @rule https?:\/\/t\.cn\/[0-9A-Za-z]{3,8}
 * @rule https?:\/\/jx\.gixiu\.com\/[0-9A-Za-z]{3,8}
 * @rule https?:\/\/kzurl\d{2}\.cn\/[0-9A-Za-z]{3,8}
 * @rule https?:\/\/u\.jd\.lu1dou\.com\/[0-9A-Za-z]{3,8}
 * @rule https:\/\/u\.jd\.com\/[0-9a-zA-Z]{7}
 * @rule https?:\/\/sourl\.cn/[0-9a-zA-Z]{3,8}
 * @rule https?:\/\/\dkma\.cn/[0-9a-zA-Z]{3,8}
 * @priority 10000
 * @admin false
 * @disable false
 * */

/*
https://jd.lsy22.cn      示例：http://jd.lsy22.cn/IKV
https://t.cn             示例：http://t.cn/A60wdbnA
https://3.cn             示例：3.cn/1-PCJffR 调研
https://jx.gixiu.com     示例：http://jx.gixiu.com/Odo2
https://kzurl16.cn       示例：https://kzurl16.cn/zOlR8 
https://u.jd.lu1dou.com  示例：https://u.jd.lu1dou.com/i3rx
*/

// 监听的群号
const whiteGroups = ['-1001804013199'];

const request = require('util').promisify(require('request'));
const SpyHandleMsg = require('../红灯区/mod/SpyHandleMsg');

module.exports = async s => {
    const content = await s.getMsg();
    const isAdmin = await s.isAdmin();
    if ((!whiteGroups?.includes(await s.getGroupId()) && !isAdmin) || /^(set) ([^ \n]+) ([^ \n]+) ([\s\S]+)$/.test(content)) return 'next';
    const ujds = content.match(/https?:\/\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\*\+,%;\=]*/g);
    if (ujds[0]) {
        let jx = [];
        for (let ujd of ujds || []) {
            try {
                let commond = ujd;
                // console.log(ujd)
                if (/https?:\/\/[a-z0-9A-Z\.]+\/[0-9a-zA-Z]{3,8}/.test(ujd)) {
                    let res = await request({
                        url: ujd,
                        method: 'get',
                        followRedirect: false,
                        timeout: 3000
                    });
                    let data = res.body;
                    let url = res.headers.location;
                    if (res.body && /u\.jd\.com/.test(ujd)) {
                        let jdurl = data.match(/(https:\/\/u\.jd\.com\/jda[^']+)/) && data.match(/(https:\/\/u\.jd\.com\/jda[^']+)/)[1] || ''
                        // console.log(url);
                        if (jdurl) {
                            let res2 = await request({
                                url: jdurl,
                                method: 'get',
                                followRedirect: false
                            });
                            url = res2.headers.location;

                            // 关注有礼
                            if (/shopId=[\d]+/.test(url) && /关注/.test(content)) {
                                commond = `export M_FOLLOW_SHOP_ARGV="${url}"`;
                            }
                            // 左侧刮奖
                            else if (/shopId=[\d]+/.test(url) && /左.*?刮/.test(content)) {
                                commond = `export M_GYG_SHOP_ARGV="${url}"`;
                            }
                            else {
                                commond = url;
                            }
                        }
                    }
                    else {
                        commond = url;
                    }
                }
                if (commond) {
                    commond = commond.replace(/\r?\n/, '');
                    let spy = await SpyHandleMsg(commond);
                    jx.push(spy || commond);
                }
                else {
                    jx.push('无效的短链接')
                }
            }
            catch (e) {
                console.log(e);
                continue;
            }
        }
        let msg = jx.join('\n┄┅┄┅┄┅┄┅┄┅┄┅┄\n');
        if (msg && isAdmin) {
            await s.reply(`短链解析结果：\n${msg}`);
        }
        return msg ? await s.inlineSugar(msg) : 'next';
    }
    return 'next';
}
