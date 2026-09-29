/**
 * validate.js —— 发布表单校验（纯函数，可单元测试）
 *
 * 校验规则：
 *  - type      必须为 lost（寻物）或 found（招领）
 *  - name      必填，1~30 字
 *  - cat       必须属于 6 个预置分类之一
 *  - place     必填，1~30 字
 *  - date      必填且合法（YYYY-MM-DD），不能晚于今天
 *  - nickname  必填，1~20 字
 *  - contact   必填，4~50 字符，仅允许 手机号/QQ/微信 常见字符
 *  - note      选填，最多 100 字
 *
 * 校验通过返回 { valid: true, data: 规范化后的字段 }；
 * 失败返回 { valid: false, errors: { 字段: 提示文案 } }，errors 只含出错字段。
 * today 参数用于“日期不能晚于今天”的判断，外部可注入以便测试。
 */
(function (global, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    global.CLFValidate = factory();
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var CATEGORIES = ['电子数码', '证件卡类', '生活用品', '衣物配饰', '钥匙工具', '其他'];
  var CONTACT_RE = /^[A-Za-z0-9_@.\-+#\u4e00-\u9fa5]{4,50}$/;

  function isStr(v) {
    return typeof v === 'string';
  }

  /** YYYY-MM-DD 且为真实存在的日期（2月30日这类直接判非法） */
  function isValidDateStr(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var p = s.split('-');
    var y = +p[0], m = +p[1], d = +p[2];
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    var dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }

  /**
   * @param input 表单原始输入
   * @param today 今天日期串，如 '2026-09-29'；缺省时取系统当天
   */
  function validatePost(input, today) {
    var errors = {};
    var data = {};

    if (!input || typeof input !== 'object') {
      return { valid: false, errors: { _: '表单数据无效' } };
    }
    today = today || (function () {
      var d = new Date();
      var m = d.getMonth() + 1, day = d.getDate();
      return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
    })();

    // 类型
    if (input.type === 'lost' || input.type === 'found') {
      data.type = input.type;
    } else {
      errors.type = '请选择发布类型（寻物 / 招领）';
    }

    // 物品名称
    var name = isStr(input.name) ? input.name.trim() : '';
    if (!name) {
      errors.name = '请填写物品名称';
    } else if (name.length > 30) {
      errors.name = '物品名称不能超过 30 个字';
    } else {
      data.name = name;
    }

    // 物品分类
    if (CATEGORIES.indexOf(input.cat) >= 0) {
      data.cat = input.cat;
    } else {
      errors.cat = '请选择物品分类';
    }

    // 地点
    var place = isStr(input.place) ? input.place.trim() : '';
    if (!place) {
      errors.place = '请填写' + (input.type === 'found' ? '拾获' : '丢失') + '地点';
    } else if (place.length > 30) {
      errors.place = '地点不能超过 30 个字';
    } else {
      data.place = place;
    }

    // 日期
    var date = isStr(input.date) ? input.date.trim() : '';
    if (!date) {
      errors.date = '请选择' + (input.type === 'found' ? '拾获' : '丢失') + '日期';
    } else if (!isValidDateStr(date)) {
      errors.date = '日期格式不正确';
    } else if (date > today) {
      errors.date = '日期不能晚于今天';
    } else {
      data.date = date;
    }

    // 发布人昵称
    var nickname = isStr(input.nickname) ? input.nickname.trim() : '';
    if (!nickname) {
      errors.nickname = '请填写怎么称呼你';
    } else if (nickname.length > 20) {
      errors.nickname = '昵称不能超过 20 个字';
    } else {
      data.nickname = nickname;
    }

    // 联系方式
    var contact = isStr(input.contact) ? input.contact.trim() : '';
    if (!contact) {
      errors.contact = '请填写联系方式，方便失主 / 拾到者找到你';
    } else if (!CONTACT_RE.test(contact)) {
      errors.contact = '联系方式需为 4~50 位手机号 / QQ / 微信号等常见格式';
    } else {
      data.contact = contact;
    }

    // 备注（选填）
    var note = isStr(input.note) ? input.note.trim() : '';
    if (note.length > 100) {
      errors.note = '备注不能超过 100 个字';
    } else {
      data.note = note;
    }

    var valid = true;
    for (var k in errors) { valid = false; break; }
    return valid ? { valid: true, data: data } : { valid: false, errors: errors };
  }

  return { validatePost: validatePost, CATEGORIES: CATEGORIES };
});
