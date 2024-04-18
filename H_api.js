/**
 * @author 小寒寒
 * @name H_api
 * @origin 小寒寒
 * @version 1.0.0
 * @description 自建api
 * @public false
 * @priority 5
 * @disable false
 * @service true
 */

const shopToken = new BncrDB('shopToken');
const H5st = require('./mod/getH5st.js');
const { USER_AGENT } = require('../红灯区/mod/USER_AGENTS.js');
const axios = require('axios');
/** Code Encryption Block[be188605b2af9d5e9f0e7db22a9634fc4073505e85759a3dce760a41daabd3f57d2eb0447c578395562b3a7c099a45a9bf8467ad4e6f6ed6223821ad3d3327dff8401078b33199f1a521b4ee4e63471ba7a50b1ba4d4cb5df4a6baf3735d8e2ea85c888f3ca979e22492327987f47857b49d2dbb2dbc3f436e1553e6c232aaeb8feaee91acecf9a599d38ea4db29e1fefce4e5ce948dd9e703f5bc2f443301ff662247c3ffec78250fd5f20f99ed68c44d3cf0b2c536d54588c9d109cb50496c2a9aeeaccc8e7314c2d6cbfe194a1568ee7be5aa3b59a923ee98612b382c59b9372be63dfb32fddfb8e76b4b7e3a103e89f275f5e7524b15ee73e4c4dd6407a59b7c76ab743408aa1eb9118c2b5820e69c2fb67362e7bf1ad2fce6944f7d186ac9b3558098fd925f191daff139e689bc4e3b511ce41bba78fcc8a015d4dbc152a7efc8295032316fdacf0f98268b4216fc1d7f590802443038a36c313ab909417fcf2df517f94ab8fdb5e8ef688b1267d2498cdbc4454102eda9b24f13fb65b760d7a9ed7fe51ca502cc0c38e2432ef7d6043e33d40e053ee951720ed75fa7712a74f7f4428f11e0f53bc234774e3c5c38eab339f47cafbd2c56f49ecbd2e74749bff003bdf4c0fb0c6c52ce5930dff49b15952cca1b619f3d331f787c157c538e570549be3a62aefe2f8c4c0633ef6d3e440ce3b2696062f17da3a4e9e2bb4d332b0f07f251a3fa5e935028123a9321427f58ff000574d2a87ec497998400feef18ed8bc1004288a940318b489121bbdf2ad6cd966971addd5034f8192233b0842ea9853c2133dba9e10a595a0f6ba3b33fff51259f6d1d33fa70fe15e9fd6858d29e152cd84dcc9553678490882ea29b4170485e437b1194acf2b2dbd6f205854b9dd3b09e1a541e18aa247ac0c7dabf2d2829a3e471dfdbe8235b53a5b81fffb6022db2bf1e9cd381b7589939640636a08347b2be77c0e958c82de208b612074be5137d7e103e41e0a2ff1305122b8beb462ab0a4975e706966a3ae4f359733e3543ae96b19a972e2b869bf2ebd75f05dfffa63738a5999f8b7ca7956c74dd66901c46f504f11286faad3f7a52ba387833afda46d753be99990b1d5352a156f5e91409529963655d2f3682cf7138c237b8ee9606f92968f8c1e72c0ee1633c36c1801b626711e55ccf1606bda30e3e586baf41befa664e1f421f586f1d1348cbe6257d49eb05695ed89ae4d5156e0dc9fde028e4b0c9bd0eb5db6087fd8c0d8613046f763be193a93da5324cf367b913970b69692ed7cbc18c05d117514c011999426830395f4837f1d0edacdae6fe4ec1ecb3b978bb3550b1708abfae0ae8734f015ea63ead59d33073218d7c343c2d06c758628a868351eae0bd4afaa1de61701af64e2229cd2192ecd919b56dde49cde5cd504662a31454dcbbb9c70a8b09198ff707cfb7e7bc8d8805e00c043095bc9c2cebcde665e840e72f73472d2ad7c97053754928d1a25be05f3eff2bd7c5d7a313da62278d9fe8c13b7c9abdb1ef5e5a56e23a8710d805395108ffebb1523713f81bd07420679697a3c1df234fbb1c4d44cbe0c7f092b2e57cfd4299b642b5b737d1adb06490f039ddb1dbd288a71133f5ce83f92b17430c1b6a2078c1e55539497d79414a2b9bce1137732dd482792c7f732a6140b3cd0ae2be1583cc4b7aa9398c5fa052c7a3421a462a93cf3140ab5491824dec08be28fc4e076b8971619963b2fd82fb85ec7e714f7f0e4577c25bdfeeaf70f1aeea2a77c3f67de6924dd0c729b2aee13ecdf38cb094b550c20eaddb9d2fbd642380a63dbed20bce63db2ee1bb7a6cdaaeb9f51a28ade51790b214c48cd4b0b21a24b4be68976af54a0e17ec8f1642776c1740d1efc76156f3f0ed1ce0ec5fbdfc92134034e828afe737de1efad2802b1f7f20204b7bf33dd12ffa491be773cc43af4987c6b5c2326f945f4723b007b6780195a70c27677d2c820e5be5c14eab5c9955ee8079b3e351a2492665310a4a2c8809e960ebedfd09d29dcf685ca283bc150be66728e5c9488b33459bf24f1521d3e6a696394beac5f5dac32991df8f2ec78c488d028b7afefb8af9e09c423a161de36d2f97374d86c4bb81189a7db34e038b747bad7a91a24db6bf5c854a42d935eece56b636c2f4c4f7a0c68c25958946f213397663ee9371d67861672f3d410b99fb0ae25c97789e93cd08832e150d536b95f4b2e62df3b24362a5a5d9b8ee61b9dbb68f3aae2b4e6f35353dfab5aa0fa0cedbaa29604c0d8f0f8d9017e085a1f3315c8f5834b3746fbee43b84f8e1520d185ba6a96ecc68a7d657470437b4958cd3165feefcf08306f80993a46ad8cfa47caaea643ff9e242d7ce18c3e839d82a521922ef121e60ee2ddc8e22d113bfcf444021e067f00de45e1419f590a6651e60fd01c7877a4bacb8c212d2748eb3ee06f83941576c97446ad81e5296511a89ab56db04995ccd1cad1f9a475aafbc4029afde76a8595eb8e36a47526428a26b98168e35eb1df5a363be4dff13913df9f4fa1bd10734ba922923151e7cf65f3aa371bee510b9cef738438b051d9e67fa2e378d22828a7ddd60a000f362ae5577b598fb2a743ad0dd38143db9b130387d12ba112237cddaa37bf6f5a22b3d28cd12f5c0f2d884e3f647902d77057797624521a82453b8fac0cc1fd7e72760f0998a719d87cc2d7e5e4dcfba130bf8d9f2911e2b1762e18803452094e186fcf09aca8f4a7af868ae2ffaf7748764ad5ef27f15d2dc4cec2140b8e392098c9fae145046ddf28c50ccef1a7ecc0113dd1f5f57d8b3ff9d53859eff2f54410b93ee6d3a43b9064f7f1f2a58e9893f6a4e2c52a416379cd63fcf6307e139011e0801198913a0cb6b6bfd03471f82bad994d00ca4b8523286938c82fdc1bafd565586fd432498f82fbd10c86b4e7b3331f08babdb1118b12600800579b32f458cd8c764fc6d2f3748fcf7eff6463ca762c8975757207d0baf217f88277d59f6982169ed88dbd347a71228a28410f9ea13b35db73e1a7fcbf402b07187e43e00595aec5e4427fa10590acd0c455cfd83ec6cd9e7ca714eb400ce55b3940c8a84c2d9f8dc83e6a99ad1b9ee2f2abcfb4c7b7ef3370f5446a14f50b459155619e47f9636ac2f9fd4658a54d84f6abbb08baea9fcafd7db12213b6a154fe73cbb06b4ce4b3cf3eecea0ea0eda9053b45375d7c7de677dac8f46df30506dffc5b63be5e02aea759a381a72a3b8ee73a2b1a0a1a577cebc773ba5e2f3bb7a20fba483a66ef3f4256a4725a377e754ea75849303956f1cb30781833fa745752913097315368814146a131595c8565a088564f073a0b3c3df12d5b27592599b97dec64fb7d42e49cd13c62603a1e5154d92fb2a10b447945c4a261ff0508535e0a459c29af5489e1026d45f23a5a28348ba9e7010cfaecee146fdd3f6b5db586702918a19e1a969bf20eb277b363722078033e516b7f8b59ace5ae5c6c3abda272f247601332abde031fafe6acc7da418819aed6288dd08d3e672b09e03e2986d2c9da6130974d60f4de6f33] */