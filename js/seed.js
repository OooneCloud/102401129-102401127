/**
 * seed.js —— 演示数据
 *
 * 首次打开页面时自动灌入一批示例信息，方便测试人员一打开就能看到完整列表。
 * 日期/时间基于“当前时刻”动态生成，保证任何时候打开数据都不过期。
 */
(function (global, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    global.CLFSeed = factory();
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var DAY = 24 * 60 * 60 * 1000;

  /** 返回相对 now 偏移 offsetDays 天的日期串（负数表示过去） */
  function dateOffset(today, offsetDays) {
    var t = new Date(today + 'T00:00:00');
    t = new Date(t.getTime() + offsetDays * DAY);
    var m = t.getMonth() + 1;
    var d = t.getDate();
    return t.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
  }

  /**
   * @param today   今天日期串 YYYY-MM-DD
   * @param now     当前时间戳
   * @returns 演示数据数组（新信息在前）
   */
  function makeDemoItems(today, now) {
    now = now || Date.now();
    function at(minutesAgo) { return now - minutesAgo * 60 * 1000; }
    return [
      {
        id: 'demo-bt-earphone',
        type: 'found', name: '蓝色无线蓝牙耳机', cat: '电子数码',
        place: '三号教学楼 305 教室', date: dateOffset(today, 0),
        nickname: '李思远', contact: '13800138821',
        note: '耳机充电盒上有一道浅划痕，今天上午在 305 上完高数后发现，暂放在讲台抽屉里，请失主联系我核对颜色和型号。',
        status: 'open', createdAt: at(30)
      },
      {
        id: 'demo-lost-card',
        type: 'lost', name: '校园一卡通', cat: '证件卡类',
        place: '第二食堂二楼', date: dateOffset(today, -1),
        nickname: '王雨萌', contact: '13522667781',
        note: '浅蓝色卡套，里面还夹着一张公交卡。应该是昨天中午打饭后落在餐盘回收处，捡到的同学麻烦联系我，非常感谢。',
        status: 'open', createdAt: at(26 * 60)
      },
      {
        id: 'demo-bt-umbrella',
        type: 'found', name: '黑色折叠雨伞', cat: '生活用品',
        place: '图书馆一层大厅', date: dateOffset(today, -1),
        nickname: '陈子航', contact: '15088991234',
        note: '伞柄上贴着一张写着姓氏的标签，伞面是纯黑色。已交给图书馆一层前台保管，凭描述认领。',
        status: 'open', createdAt: at(20 * 60)
      },
      {
        id: 'demo-lost-charger',
        type: 'lost', name: '银色 MacBook 充电器 61W', cat: '电子数码',
        place: '二号实验楼 402 教室', date: dateOffset(today, -2),
        nickname: '赵一诺', contact: '18633449087',
        note: '充电线上缠着黑色魔术贴，可能是上完电路实验课后落在第二排座位下面，麻烦帮忙留意一下实验楼失物箱。',
        status: 'open', createdAt: at(2 * 24 * 60)
      },
      {
        id: 'demo-bt-bottle',
        type: 'found', name: '粉色保温杯', cat: '生活用品',
        place: '体育馆羽毛球场', date: dateOffset(today, -3),
        nickname: '周静怡', contact: '13766210088',
        note: '杯身有一张咖啡店贴纸和一处磕痕，杯盖是白色。已交给体育馆器材室值班老师，周三到周日都可以领取。',
        status: 'open', createdAt: at(3 * 24 * 60)
      },
      {
        id: 'demo-lost-hoodie',
        type: 'lost', name: '灰色连帽卫衣（带校徽）', cat: '衣物配饰',
        place: '南操场看台第三排', date: dateOffset(today, -4),
        nickname: '孙浩然', contact: '18922774455',
        note: '卫衣左袖口有几点白色油漆，左胸有校徽刺绣。是看晚会时放在第三排座位上，散场后发现不见了。',
        status: 'open', createdAt: at(4 * 24 * 60)
      },
      {
        id: 'demo-bt-keys',
        type: 'found', name: '自行车钥匙（带黄色小挂坠）', cat: '钥匙工具',
        place: '学生公寓 7 号楼车棚', date: dateOffset(today, -5),
        nickname: '郑晓萌', contact: '18899112233',
        note: '钥匙串上共三把钥匙，挂着一个黄色小鸭子挂坠。已在公寓值班处登记，认领时请描述挂坠样式。',
        status: 'resolved', createdAt: at(5 * 24 * 60)
      },
      {
        id: 'demo-lost-textbook',
        type: 'lost', name: '高等数学教材（第七版）', cat: '其他',
        place: '一号教学楼 A 座 201', date: dateOffset(today, -6),
        nickname: '吴嘉禾', contact: '13355667788',
        note: '书内有少量铅笔笔记，扉页写了名字。找回后不复读了，谢谢大家。',
        status: 'resolved', createdAt: at(6 * 24 * 60)
      }
    ];
  }

  return { makeDemoItems: makeDemoItems };
});
