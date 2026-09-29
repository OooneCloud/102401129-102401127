/**
 * util.js —— 纯工具函数（不依赖 DOM，可单元测试）
 *
 * 包含：HTML 转义（防 XSS）、类型文案、日期/相对时间格式化。
 * 时间格式化结果与展示直接相关，抽成纯函数便于用固定用例验证。
 */
(function (global, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    global.CLFUtil = factory();
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  /** HTML 转义：所有用户输入渲染前必须调用，防止输入内容注入页面 */
  function escapeHTML(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function typeLabel(type) {
    return type === 'found' ? '招领' : '寻物';
  }

  /** '2026-09-29' → '今天' / '昨天' / '9月29日'（跨年加年份） */
  function formatDate(dateStr, now) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(dateStr || '');
    if (!m) return dateStr || '';
    var y = +m[1], mo = +m[2], d = +m[3];
    var n = now ? new Date(now) : new Date();
    var today = new Date(n.getFullYear(), n.getMonth(), n.getDate());
    var that = new Date(y, mo - 1, d);
    var diff = Math.round((today - that) / 86400000);
    var label = mo + '月' + d + '日';
    if (diff === 0) return '今天';
    if (diff === 1) return '昨天';
    if (y !== n.getFullYear()) return y + '年' + label;
    return label;
  }

  /** 时间戳 → '刚刚 / N分钟前 / N小时前 / 昨天 / M月D日' */
  function timeAgo(ts, now) {
    var base = now !== undefined ? now : Date.now();
    var diff = base - ts;
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 48 * 60 * 60 * 1000) return '昨天';
    var d = new Date(ts);
    var label = (d.getMonth() + 1) + '月' + d.getDate() + '日';
    if (d.getFullYear() !== new Date(base).getFullYear()) return d.getFullYear() + '年' + label;
    return label;
  }

  return {
    escapeHTML: escapeHTML,
    typeLabel: typeLabel,
    formatDate: formatDate,
    timeAgo: timeAgo
  };
});
